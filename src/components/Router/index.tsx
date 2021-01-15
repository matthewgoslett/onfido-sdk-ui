import { h, Component, FunctionComponent } from 'preact'
import {
  createMemoryHistory,
  createBrowserHistory,
  History,
  LocationListener,
  MemoryHistory,
} from 'history'
import { EventEmitter2 } from 'eventemitter2'

import { pick } from '~utils/object'
import { isDesktop, getUnsupportedMobileBrowserError } from '~utils/index'
import { jwtExpired, getEnterpriseFeaturesFromJWT } from '~utils/jwt'
import { noop } from '~utils/func'
import { createSocket } from '~utils/crossDeviceSync'
import { buildComponentsList, ComponentStep } from './StepComponentMap'
import StepsRouter from './StepsRouter'
import themeWrap from '../Theme'
import Spinner from '../Spinner'
import GenericError from '../GenericError'
import withCameraDetection, {
  CameraDetectionProps,
} from '../Capture/withCameraDetection'

import {
  getWoopraCookie,
  setWoopraCookie,
  trackException,
  uninstallWoopra,
} from '../../Tracker'
import { LocaleProvider } from '../../locales'

import type { FlowVariants } from '~types/commons'
import type {
  DocumentTypes,
  StepConfig,
  StepConfigDocument,
} from '~types/steps'
import type { SdkOptions } from '~types/sdk'
import type { ReduxProps } from 'components/App/withConnect'
import type { CaptureState } from 'components/ReduxAppWrapper/types'

const restrictedXDevice = process.env.RESTRICTED_XDEVICE_FEATURE_ENABLED

const isUploadFallbackOffAndShouldUseCamera = (step: StepConfig): boolean => {
  if (!step.options || (step.type != 'document' && step.type != 'face')) {
    return false
  }

  return (
    step.options?.uploadFallback === false &&
    (step.type === 'face' || step.options?.useLiveDocumentCapture)
  )
}

type CaptureKeys = keyof CaptureState

type OmittedSdkOptions = Omit<
  SdkOptions,
  | 'containerEl'
  | 'containerId'
  | 'isModalOpen'
  | 'onModalRequestClose'
  | 'shouldCloseOnOverlayClick'
  | 'useModal'
> & {
  events: EventEmitter2.emitter
}

type StepIndexType = 'client' | 'user'

type RouterProps = {
  options: OmittedSdkOptions
} & ReduxProps &
  CameraDetectionProps

type InternalRouterProps = {
  allowCrossDeviceFlow: boolean
  onFlowChange?: (
    newFlow: FlowVariants,
    newStep: number,
    previousFlow: FlowVariants,
    payload: {
      userStepIndex: number
      clientStepIndex: number
      clientStep: ComponentStep
    }
  ) => void
} & RouterProps

const Router: FunctionComponent<RouterProps> = (props) => {
  const RouterComponent = props.options.mobileFlow
    ? CrossDeviceMobileRouter
    : MainRouter

  return (
    <RouterComponent
      {...props}
      allowCrossDeviceFlow={!props.options.mobileFlow && isDesktop}
    />
  )
}

// Wrap components with theme that include navigation and footer
const WrappedSpinner = themeWrap(Spinner)
const WrappedError = themeWrap(GenericError)

type CrossDeviceState = {
  crossDeviceError?: Record<string, unknown>
  crossDeviceInitialStep?: number
  language?: string
  loading?: boolean
  roomId?: string
  socket: SocketIOClient.Socket
  step?: number
  stepIndexType?: StepIndexType
  steps?: StepConfig[]
  token?: string
}

class CrossDeviceMobileRouter extends Component<
  InternalRouterProps,
  CrossDeviceState
> {
  private configTimeoutId?: number = null
  private pingTimeoutId?: number = null

  constructor(props: InternalRouterProps) {
    super(props)
    // Some environments put the link ID in the query string so they can serve
    // the cross device flow without running nginx
    const url = props.urls.sync_url
    const roomId = window.location.pathname.substring(3) || props.options.roomId

    this.state = {
      token: null,
      steps: null,
      step: null,
      socket: createSocket(url),
      roomId,
      crossDeviceError: null,
      loading: true,
    }

    if (restrictedXDevice && isDesktop) {
      this.setError('FORBIDDEN_CLIENT_ERROR')
      return
    }

    this.state.socket.on('config', this.setMobileConfig(props.actions))
    this.state.socket.on('connect', () => {
      this.state.socket.emit('join', { roomId: this.state.roomId })
    })
    this.state.socket.open()
    this.requestMobileConfig()

    if (this.props.options.mobileFlow) {
      this.sendMessage('cross device start')
      addEventListener('userAnalyticsEvent', (event) => {
        this.sendMessage('user analytics', {
          detail: { ...event.detail, isCrossDevice: true },
        })
      })
    }
  }

  componentDidMount() {
    this.state.socket.on('custom disconnect', this.onDisconnect)
    this.state.socket.on('disconnect pong', this.onDisconnectPong)
  }

  componentWillUnmount() {
    this.clearConfigTimeout()
    this.clearPingTimeout()
    this.state.socket.close()
  }

  sendMessage = (event: string, payload?: Record<string, unknown>) => {
    const roomId = this.state.roomId
    this.state.socket.emit('message', { roomId, event, payload })
  }

  requestMobileConfig = () => {
    this.sendMessage('get config')
    this.clearConfigTimeout()
    this.configTimeoutId = window.setTimeout(() => {
      if (this.state.loading) this.setError()
    }, 10000)
  }

  clearConfigTimeout = () =>
    this.configTimeoutId && clearTimeout(this.configTimeoutId)

  clearPingTimeout = () => {
    if (this.pingTimeoutId) {
      clearTimeout(this.pingTimeoutId)
      this.pingTimeoutId = null
    }
  }

  setMobileConfig = (actions) => (data) => {
    const {
      token,
      urls,
      steps,
      language,
      documentType,
      idDocumentIssuingCountry,
      poaDocumentType,
      step: userStepIndex,
      clientStepIndex,
      woopraCookie,
      disableAnalytics,
      enterpriseFeatures,
    } = data

    if (disableAnalytics) {
      uninstallWoopra()
    } else {
      setWoopraCookie(woopraCookie)
    }
    if (!token) {
      console.error('Desktop did not send token')
      trackException('Desktop did not send token')
      return this.setError()
    }
    if (jwtExpired(token)) {
      console.error('Desktop token has expired')
      trackException(`Token has expired: ${token}`)
      return this.setError()
    }

    const isFaceStep = steps[clientStepIndex].type === 'face'

    this.setState(
      {
        token,
        steps,
        step: isFaceStep ? clientStepIndex : userStepIndex,
        stepIndexType: isFaceStep ? 'client' : 'user',
        crossDeviceError: null,
        language,
      },
      // Temporary fix for https://github.com/valotas/preact-context/issues/20
      // Once a fix is released, it should be done in CX-2571
      () => this.setState({ loading: false })
    )
    if (urls) {
      actions.setUrls(urls)
    }
    if (poaDocumentType) {
      actions.setPoADocumentType(poaDocumentType)
    } else {
      actions.setIdDocumentType(documentType)
      if (documentType !== 'passport') {
        actions.setIdDocumentIssuingCountry(idDocumentIssuingCountry)
      }
    }
    if (enterpriseFeatures) {
      const validEnterpriseFeatures = getEnterpriseFeaturesFromJWT(token)
      if (
        enterpriseFeatures.hideOnfidoLogo &&
        validEnterpriseFeatures?.hideOnfidoLogo
      ) {
        actions.hideOnfidoLogo(true)
      } else {
        actions.hideOnfidoLogo(false)
        if (enterpriseFeatures.cobrand && validEnterpriseFeatures?.cobrand) {
          actions.showCobranding(enterpriseFeatures.cobrand)
        }
      }
    } else {
      actions.hideOnfidoLogo(false)
      actions.showCobranding(null)
    }
    actions.acceptTerms()
  }

  setError = (name = 'GENERIC_CLIENT_ERROR') => {
    this.setState({ crossDeviceError: { name }, loading: false })
  }

  onDisconnect = () => {
    this.pingTimeoutId = window.setTimeout(this.setError, 3000)
    this.sendMessage('disconnect ping')
  }

  onDisconnectPong = () => this.clearPingTimeout()

  sendClientSuccess = () => {
    this.state.socket.off('custom disconnect', this.onDisconnect)
    const captures = (Object.keys(this.props.captures) as CaptureKeys[]).reduce(
      (acc, key) => {
        const dataWhitelist = [
          'documentType',
          'idDocumentIssuingCountry',
          'poaDocumentType',
          'id',
          'metadata',
          'method',
          'side',
        ]
        return acc.concat(pick(this.props.captures[key], dataWhitelist))
      },
      []
    )
    this.sendMessage('client success', { captures })
  }

  renderLoadingOrErrors = () => {
    const steps = this.state.steps
    const shouldStrictlyUseCamera =
      steps && steps.some(isUploadFallbackOffAndShouldUseCamera)
    const { hasCamera } = this.props

    if (this.state.loading) return <WrappedSpinner disableNavigation={true} />
    if (this.state.crossDeviceError) {
      return (
        <WrappedError
          disableNavigation={true}
          error={this.state.crossDeviceError}
        />
      )
    }
    if (!hasCamera && shouldStrictlyUseCamera) {
      return (
        <WrappedError
          disableNavigation={true}
          error={{ name: getUnsupportedMobileBrowserError() }}
        />
      )
    }
    return null
  }

  render = () => {
    const { language } = this.state
    return (
      <LocaleProvider language={language}>
        {this.renderLoadingOrErrors() || (
          <HistoryRouter
            {...this.props}
            {...this.state}
            sendClientSuccess={this.sendClientSuccess}
            crossDeviceClientError={this.setError}
          />
        )}
      </LocaleProvider>
    )
  }
}

type MainState = {
  crossDeviceInitialClientStep?: number
  crossDeviceInitialStep?: number
}

class MainRouter extends Component<InternalRouterProps, MainState> {
  constructor(props: InternalRouterProps) {
    super(props)

    this.state = {
      crossDeviceInitialStep: null,
    }
  }

  generateMobileConfig = () => {
    const {
      documentType,
      idDocumentIssuingCountry,
      poaDocumentType,
      deviceHasCameraSupport,
      options,
      urls,
    } = this.props

    const {
      steps,
      token,
      language,
      disableAnalytics,
      enterpriseFeatures,
    } = options

    const woopraCookie = !disableAnalytics ? getWoopraCookie() : null

    return {
      steps,
      token,
      urls,
      language,
      documentType,
      idDocumentIssuingCountry,
      poaDocumentType,
      deviceHasCameraSupport,
      woopraCookie,
      disableAnalytics,
      step: this.state.crossDeviceInitialStep,
      clientStepIndex: this.state.crossDeviceInitialClientStep,
      enterpriseFeatures,
    }
  }

  onFlowChange = (
    newFlow,
    newStep,
    previousFlow,
    { userStepIndex, clientStepIndex }
  ) => {
    if (newFlow === 'crossDeviceSteps') {
      this.setState({
        crossDeviceInitialStep: userStepIndex,
        crossDeviceInitialClientStep: clientStepIndex,
      })
    }
  }
  renderUnsupportedBrowserError = () => {
    const steps = this.props.options.steps
    const shouldStrictlyUseCamera =
      steps && steps.some(isUploadFallbackOffAndShouldUseCamera)
    const { hasCamera } = this.props

    if (!isDesktop && !hasCamera && shouldStrictlyUseCamera) {
      return (
        <WrappedError
          disableNavigation={true}
          error={{ name: getUnsupportedMobileBrowserError() }}
        />
      )
    }
    return null
  }

  render = () =>
    this.renderUnsupportedBrowserError() || (
      <HistoryRouter
        {...this.props}
        steps={this.props.options.steps}
        onFlowChange={this.onFlowChange}
        mobileConfig={this.generateMobileConfig()}
      />
    )
}

const findFirstIndex = (
  componentsList: ComponentStep[],
  clientStepIndex: number
) => componentsList.findIndex(({ stepIndex }) => stepIndex === clientStepIndex)

type HistoryRouterProps = {
  crossDeviceClientError: (name?: string) => void
  mobileConfig: unknown
  sendClientSuccess: () => void
} & InternalRouterProps &
  CrossDeviceState

type HistoryLocationState = {
  step: number
  flow: FlowVariants
}

type HistoryRouterState = {
  initialStep: number
} & HistoryLocationState

class HistoryRouter extends Component<HistoryRouterProps, HistoryRouterState> {
  private history:
    | MemoryHistory<HistoryLocationState>
    | History<HistoryLocationState>
  private unlisten: () => void

  constructor(props: HistoryRouterProps) {
    super(props)

    const componentsList = this.getComponentsList(
      { flow: 'captureSteps' },
      this.props
    )

    const stepIndex =
      this.props.stepIndexType === 'client'
        ? findFirstIndex(componentsList, this.props.step || 0)
        : this.props.step || 0

    this.state = {
      flow: 'captureSteps',
      step: stepIndex,
      initialStep: stepIndex,
    }
    this.history = this.props.options.useMemoryHistory
      ? createMemoryHistory()
      : createBrowserHistory()
    this.unlisten = this.history.listen(this.onHistoryChange)
    this.setStepIndex(this.state.step, this.state.flow)
  }

  onHistoryChange: LocationListener<HistoryLocationState> = ({
    state: historyState,
  }) => {
    this.setState({ ...historyState })
  }

  componentWillUnmount() {
    this.unlisten()
  }

  getStepType = (step: number) => {
    const componentList = this.getComponentsList()
    return componentList[step] ? componentList[step].step.type : null
  }

  disableNavigation = () => {
    return (
      this.props.isNavigationDisabled ||
      this.initialStep() ||
      this.getStepType(this.state.step) === 'complete'
    )
  }

  initialStep = () =>
    this.state.initialStep === this.state.step &&
    this.state.flow === 'captureSteps'

  changeFlowTo = (
    newFlow: FlowVariants,
    newStep = 0,
    excludeStepFromHistory = false
  ) => {
    const { flow: previousFlow, step: previousUserStepIndex } = this.state
    if (previousFlow === newFlow) return

    const previousUserStep = this.getComponentsList()[previousUserStepIndex]

    this.props.onFlowChange(newFlow, newStep, previousFlow, {
      userStepIndex: previousUserStepIndex,
      clientStepIndex: previousUserStep.stepIndex,
      clientStep: previousUserStep,
    })
    this.setStepIndex(newStep, newFlow, excludeStepFromHistory)
  }

  nextStep = () => {
    const { step: currentStep } = this.state
    const componentsList = this.getComponentsList()
    const newStepIndex = currentStep + 1
    if (componentsList.length === newStepIndex) {
      this.triggerOnComplete()
    } else {
      this.setStepIndex(newStepIndex)
    }
  }

  triggerOnComplete = () => {
    const { captures } = this.props

    const data = (Object.keys(captures) as CaptureKeys[]).reduce(
      (acc, key) => ({
        ...acc,
        [key]: captures[key].metadata,
      }),
      {}
    )

    this.props.options.events.emit('complete', data)
  }

  formattedError = (
    response: string | { error: Record<string, unknown> },
    status: number
  ) => {
    const errorResponse = response.error || response || {}
    // TODO: remove once find_document_in_image back-end `/validate_document` returns error response with same signature
    const isExpiredTokenErrorMessage =
      typeof response === 'string' && response.includes('expired')
    const isExpiredTokenError =
      status === 401 &&
      (isExpiredTokenErrorMessage || errorResponse.type === 'expired_token')
    const type = isExpiredTokenError ? 'expired_token' : 'exception'
    // `/validate_document` returns a string only. Example: "Token has expired."
    // Ticket in backlog to update all APIs to use signature similar to main Onfido API
    const message = errorResponse.message || response
    return { type, message }
  }

  triggerOnError = (apiResponse: Record<string, unknown>) => {
    const { status, response } = apiResponse
    if (status === 0) return
    const error = this.formattedError(response, status)
    const { type, message } = error
    this.props.options.events.emit('error', { type, message })
    trackException(`${type} - ${message}`)
  }

  previousStep = () => {
    const { step: currentStep } = this.state
    this.setStepIndex(currentStep - 1)
  }

  back = () => {
    this.history.goBack()
  }

  setStepIndex = (
    newStepIndex: number,
    newFlow?: FlowVariants,
    excludeStepFromHistory?: boolean
  ) => {
    const { flow: currentFlow } = this.state
    const newState = {
      step: newStepIndex,
      flow: newFlow || currentFlow,
    }
    if (excludeStepFromHistory) {
      this.setState(newState)
    } else {
      const path = `${location.pathname}${location.search}${location.hash}`
      this.history.push(path, newState)
    }
  }

  getComponentsList = (
    state: Partial<HistoryRouterState> = this.state,
    props: Partial<HistoryRouterProps> = this.props
  ) => {
    const { flow } = state
    const {
      documentType,
      poaDocumentType,
      steps,
      deviceHasCameraSupport,
      options: { mobileFlow },
    } = props

    return buildComponentsList({
      flow,
      documentType,
      poaDocumentType,
      steps,
      mobileFlow,
      deviceHasCameraSupport,
    })
  }

  getDocumentType = (): DocumentTypes => {
    const { documentType, steps } = this.props
    const documentStep = steps.find(
      (step) => step.type === 'document'
    ) as StepConfigDocument

    const documentTypes = documentStep?.options?.documentTypes || {}
    const enabledDocuments = Object.keys(documentTypes) as DocumentTypes[]
    const isSinglePreselectedDocument = enabledDocuments.length === 1

    if (isSinglePreselectedDocument && !documentType) {
      return enabledDocuments[0]
    }

    return documentType
  }

  render = () => {
    const documentType = this.getDocumentType()

    return (
      <StepsRouter
        {...this.props}
        documentType={documentType}
        componentsList={this.getComponentsList()}
        step={this.state.step}
        disableNavigation={this.disableNavigation()}
        changeFlowTo={this.changeFlowTo}
        nextStep={this.nextStep}
        previousStep={this.previousStep}
        triggerOnError={this.triggerOnError}
        back={this.back}
      />
    )
  }
}

HistoryRouter.defaultProps = {
  onFlowChange: noop,
  stepIndexType: 'user',
}

export default withCameraDetection(Router)
