import type { ComponentType } from 'preact'
import Welcome from '../Welcome'
import { SelectPoADocument, SelectIdentityDocument } from '../Select'
import CountrySelector from '../CountrySelector'
import ImageQualityGuide from '../Uploader/ImageQualityGuide'
import SelfieIntro from '../Photo/SelfieIntro'
import {
  FrontDocumentCapture,
  BackDocumentCapture,
  SelfieCapture,
  VideoCapture,
} from '../Capture'
import {
  DocumentFrontConfirm,
  DocumentBackConfirm,
  SelfieConfirm,
  VideoConfirm,
} from '../Confirm'
import Complete from '../Complete'
import MobileFlow from '../crossDevice/MobileFlow'
import CrossDeviceLink from '../crossDevice/CrossDeviceLink'
import ClientSuccess from '../crossDevice/ClientSuccess'
import CrossDeviceIntro from '../crossDevice/Intro'
import VideoIntro from '../Video/Intro'
import { PoACapture, PoAIntro, PoAGuidance } from '../ProofOfAddress'
import { isDesktop, isHybrid, hasOnePreselectedDocument } from '~utils/index'
import { getCountryDataForDocumentType } from '../../supported-documents'

import type {
  DocumentTypes,
  DocumentTypeConfig,
  StepTypes,
  StepConfig,
  StepConfigDocument,
  StepConfigFace,
} from '~types/steps'

const FLOW_CAPTURE = 'captureSteps'
const FLOW_CROSS_DEVICE = 'crossDeviceSteps'
type FlowTypes = typeof FLOW_CAPTURE | typeof FLOW_CROSS_DEVICE

const STEP_CROSS_DEVICE = 'crossDevice'
type ExtendedStepTypes = StepTypes | typeof STEP_CROSS_DEVICE
type ExtendedStepConfig = StepConfig | { type: typeof STEP_CROSS_DEVICE }

type ComponentsByStepType = Partial<Record<ExtendedStepTypes, ComponentType[]>>
type ComponentStep = {
  component: ComponentType
  step: ExtendedStepConfig
  stepIndex: number
}

const shallowFlatten = <T>(list: T[][]): T[] => [].concat(...list)

export const buildComponentsList = ({
  flow,
  documentType,
  steps,
  mobileFlow,
  deviceHasCameraSupport,
}: {
  flow: FlowTypes
  documentType: DocumentTypes
  steps: StepConfig[]
  mobileFlow: boolean
  deviceHasCameraSupport: boolean
}): ComponentStep[] => {
  const captureSteps = mobileFlow ? buildClientCaptureSteps(steps) : steps
  return flow === 'captureSteps'
    ? buildComponentsFromSteps(
        buildCaptureStepComponents(
          documentType,
          mobileFlow,
          steps,
          deviceHasCameraSupport
        ),
        captureSteps
      )
    : buildComponentsFromSteps(crossDeviceComponents, crossDeviceSteps(steps))
}

const isComplete = (step: StepConfig): boolean => step.type === 'complete'

const hasCompleteStep = (steps: StepConfig[]): boolean => steps.some(isComplete)

const buildClientCaptureSteps = (steps: StepConfig[]): StepConfig[] =>
  hasCompleteStep(steps) ? steps : [...steps, { type: 'complete' }]

const shouldUseVideo = (steps: StepConfig[]): boolean => {
  const faceStep = steps.find(({ type }) => type === 'face') as StepConfigFace

  return (
    faceStep?.options?.requestedVariant === 'video' &&
    window.MediaRecorder != null
  )
}

const shouldUseCameraForDocumentCapture = (
  steps: StepConfig[],
  deviceHasCameraSupport: boolean
): boolean => {
  const documentStep = steps.find(
    (step) => step.type === 'document'
  ) as StepConfigDocument

  const canUseLiveDocumentCapture =
    (!isDesktop || isHybrid) && documentStep?.options?.useLiveDocumentCapture

  return (
    (canUseLiveDocumentCapture || documentStep?.options?.useWebcam) &&
    deviceHasCameraSupport
  )
}

const buildCaptureStepComponents = (
  documentType: DocumentTypes,
  mobileFlow: boolean,
  steps: StepConfig[],
  deviceHasCameraSupport: boolean
): ComponentsByStepType => {
  const documentStep = steps.find(
    (step) => step.type === 'document'
  ) as StepConfigDocument
  const documentStepOptions = documentStep?.options

  // DEPRECATED: documentStep.options.showCountrySelection will be deprecated in a future release
  const showCountrySelectionForSinglePreselectedDocument =
    documentStepOptions?.showCountrySelection

  const configForDocumentType = documentStepOptions?.documentTypes[documentType]
  const complete = mobileFlow ? [ClientSuccess] : [Complete]

  return {
    welcome: [Welcome],
    document: buildDocumentComponents(
      documentType,
      hasOnePreselectedDocument(steps),
      showCountrySelectionForSinglePreselectedDocument,
      shouldUseCameraForDocumentCapture(steps, deviceHasCameraSupport),
      configForDocumentType
    ),
    poa: [
      PoAIntro,
      SelectPoADocument,
      PoAGuidance,
      PoACapture,
      DocumentFrontConfirm,
    ],
    face: buildFaceComponents(steps, deviceHasCameraSupport, mobileFlow),
    complete,
  }
}

const buildFaceComponents = (
  steps: StepConfig[],
  deviceHasCameraSupport: boolean,
  mobileFlow: boolean
): ComponentType[] => {
  const faceStep = steps.find((step) => step.type === 'face') as StepConfigFace
  const shouldDisplayUploader = faceStep?.options?.useUploader

  // if shouldDisplayUploader is true webcam should not be used
  const shouldSelfieScreenUseCamera =
    !shouldDisplayUploader && deviceHasCameraSupport

  return shouldUseVideo(steps)
    ? buildRequiredVideoComponents(deviceHasCameraSupport, mobileFlow)
    : buildRequiredSelfieComponents(shouldSelfieScreenUseCamera)
}

const buildRequiredVideoComponents = (
  shouldUseCamera: boolean,
  mobileFlow: boolean
): ComponentType[] => {
  const allVideoSteps = [VideoIntro, VideoCapture, VideoConfirm]

  if (mobileFlow && !shouldUseCamera) {
    // do not display intro on cross device flow
    return allVideoSteps.slice(1)
  }

  return allVideoSteps
}

const buildRequiredSelfieComponents = (
  deviceHasCameraSupport: boolean
): ComponentType[] => {
  const allSelfieSteps = [SelfieIntro, SelfieCapture, SelfieConfirm]

  if (!deviceHasCameraSupport) {
    // do not display intro if camera cannot be used
    return allSelfieSteps.slice(1)
  }

  return allSelfieSteps
}

const buildNonPassportDocumentFrontCaptureComponents = (
  hasOnePreselectedDocument: boolean,
  showCountrySelection: boolean
): ComponentType[] => {
  const frontCaptureComponents = [FrontDocumentCapture, DocumentFrontConfirm]

  if (hasOnePreselectedDocument && showCountrySelection) {
    return [CountrySelector, ...frontCaptureComponents]
  }

  if (hasOnePreselectedDocument && !showCountrySelection) {
    return frontCaptureComponents
  }

  if (!hasOnePreselectedDocument && !showCountrySelection) {
    return [SelectIdentityDocument, ...frontCaptureComponents]
  }

  // !hasOnePreselectedDocument && showCountrySelection
  return [SelectIdentityDocument, CountrySelector, ...frontCaptureComponents]
}

const buildDocumentComponents = (
  documentType: DocumentTypes,
  hasOnePreselectedDocument: boolean,
  showCountrySelectionForSinglePreselectedDocument: boolean,
  shouldUseCameraForDocumentCapture: boolean,
  configForDocumentType: Optional<DocumentTypeConfig>
): ComponentType[] => {
  const doubleSidedDocs = [
    'driving_licence',
    'national_identity_card',
    'residence_permit',
  ]
  const isPassportDocument = documentType === 'passport'
  const isDocumentUpload = !shouldUseCameraForDocumentCapture

  if (isPassportDocument) {
    let frontCaptureComponents = [FrontDocumentCapture, DocumentFrontConfirm]

    if (isDocumentUpload) {
      frontCaptureComponents = [
        FrontDocumentCapture,
        ImageQualityGuide,
        DocumentFrontConfirm,
      ]
    }

    if (hasOnePreselectedDocument) {
      return frontCaptureComponents
    }

    return [SelectIdentityDocument, ...frontCaptureComponents]
  }

  const countryCode =
    typeof configForDocumentType === 'boolean'
      ? null
      : configForDocumentType?.country
  const supportedCountry = getCountryDataForDocumentType(
    countryCode,
    documentType
  )
  const showCountrySelection =
    showCountrySelectionForSinglePreselectedDocument ||
    (!hasOnePreselectedDocument && !supportedCountry && countryCode !== null)
  const frontDocumentFlow = buildNonPassportDocumentFrontCaptureComponents(
    hasOnePreselectedDocument,
    showCountrySelection
  )

  if (doubleSidedDocs.includes(documentType)) {
    return [...frontDocumentFlow, BackDocumentCapture, DocumentBackConfirm]
  }

  return frontDocumentFlow
}

const crossDeviceSteps = (steps: StepConfig[]): ExtendedStepConfig[] => {
  const baseSteps: ExtendedStepConfig[] = [{ type: 'crossDevice' }]
  const completeStep = steps.find(isComplete)
  return hasCompleteStep(steps) ? [...baseSteps, completeStep] : baseSteps
}

const crossDeviceComponents: ComponentsByStepType = {
  crossDevice: [CrossDeviceIntro, CrossDeviceLink, MobileFlow],
  complete: [Complete],
}

const buildComponentsFromSteps = (
  components: ComponentsByStepType,
  steps: ExtendedStepConfig[]
): ComponentStep[] =>
  shallowFlatten(
    steps.map((step, stepIndex) => createComponent(components, step, stepIndex))
  )

const createComponent = (
  components: ComponentsByStepType,
  step: ExtendedStepConfig,
  stepIndex: number
): ComponentStep[] => {
  const { type } = step
  if (!(type in components)) {
    console.error(`No such step: ${type}`)
  }
  return components[type].map(wrapComponent(step, stepIndex))
}

const wrapComponent = (step: ExtendedStepConfig, stepIndex: number) => (
  component: ComponentType
): ComponentStep => ({
  component,
  step,
  stepIndex,
})
