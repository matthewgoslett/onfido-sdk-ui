import type { ComponentType } from 'preact'

import type { ApiRequest } from './api'
import type {
  ExtendedStepConfig,
  FlowVariants,
  NarrowSdkOptions,
  ErrorNames,
  ErrorTypes,
} from './commons'
import type { WithCameraDetectionProps } from './hocs'
import type {
  CaptureOptions,
  StepOptionWelcome,
  StepOptionDocument,
  StepOptionPoA,
  StepOptionFace,
  StepOptionComplete,
} from './steps'
import type { CapturePayload } from './redux'
import type { ReduxProps } from 'components/App/withConnect'

export type StepIndexType = 'client' | 'user'

export type FlowChangeCallback = (
  newFlow: FlowVariants,
  newStep: number,
  previousFlow: FlowVariants,
  payload: {
    userStepIndex: number
    clientStepIndex: number
    clientStep: ComponentStep
  }
) => void

export type ChangeFlowProp = (
  newFlow: FlowVariants,
  newStep?: number,
  excludeStepFromHistory?: boolean
) => void

export type TrackScreenProp = (
  screenNameHierarchy: string | string[],
  properties?: Record<string, unknown>
) => void

export type TriggerOnErrorProp = (response: ApiRequest) => void

export type HandleCaptureProp = (payload: CapturePayload) => void

export type RenderFallbackProp = (text: string) => JSX.Element

export type ErrorProp = {
  name: ErrorNames
  type?: ErrorTypes
}

export type PropsFromRouter = {
  back: () => void
  changeFlowTo: ChangeFlowProp
  componentsList: ComponentStep[]
  nextStep: () => void
  previousStep: () => void
  triggerOnError: TriggerOnErrorProp
  step: number
}

export type RouterOwnProps = {
  options: NarrowSdkOptions
} & ReduxProps

export type RouterProps = {
  allowCrossDeviceFlow: boolean
  onFlowChange?: FlowChangeCallback
} & RouterOwnProps &
  WithCameraDetectionProps

type StepComponentBaseProps = {
  resetSdkFocus: () => void
  trackScreen: TrackScreenProp
} & RouterProps

export type StepComponentWelcomeProps = StepOptionWelcome &
  StepComponentBaseProps
export type StepComponentDocumentProps = StepOptionDocument &
  StepComponentBaseProps
export type StepComponentPoaProps = StepOptionPoA & StepComponentBaseProps
export type StepComponentFaceProps = StepOptionFace & StepComponentBaseProps
export type StepComponentCompleteProps = StepOptionComplete &
  StepComponentBaseProps
export type StepComponentCaptureProps = CaptureOptions & StepComponentBaseProps

export type StepComponentProps =
  | StepComponentWelcomeProps
  | StepComponentDocumentProps
  | StepComponentPoaProps
  | StepComponentFaceProps
  | StepComponentCompleteProps

export type ComponentStep = {
  component: ComponentType<StepComponentProps>
  step: ExtendedStepConfig
  stepIndex: number
}
