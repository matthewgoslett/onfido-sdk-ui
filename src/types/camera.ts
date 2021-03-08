import { h, Ref } from 'preact'
import Webcam from 'react-webcam-onfido'

import type { WithPermissionsFlowProps } from './hocs'
import type { RenderFallbackProp } from './routers'

export type ButtonType = 'photo' | 'video'

export type CameraProps = {
  audio?: boolean
  buttonType?: ButtonType
  children?: h.JSX.Element | h.JSX.Element[]
  className?: string
  containerClassName?: string
  docAutoCaptureFrame?: boolean
  docLiveCaptureFrame?: boolean
  facing?: VideoFacingModeEnum
  fallbackToDefaultWidth?: boolean
  idealCameraWidth?: number
  isButtonDisabled?: boolean
  isUploadFallbackDisabled?: boolean
  onButtonClick?: () => void
  renderError?: h.JSX.Element
  renderFallback: RenderFallbackProp
  renderTitle?: h.JSX.Element
  renderVideoLayer?: (props: WithPermissionsFlowProps) => h.JSX.Element
  webcamRef?: Ref<Webcam>
}
