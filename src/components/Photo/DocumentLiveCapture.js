import { h, Component } from 'preact'
import { screenshot } from '~utils/camera'
import { mimeType } from '~utils/blob'
import { getInactiveError } from '~utils/inactiveError'
import { DocumentOverlay } from '../Overlay'
import { ToggleFullScreen } from '../FullScreen'
import { sendEvent } from '../../Tracker'
import Spinner from '../Spinner'
import Timeout from '../Timeout'
import Camera from '../Camera'
import CameraError from '../CameraError'
import style from './style.scss'

/* type State = {
  hasBecomeInactive: boolean,
  hasCameraError: boolean,
  isCapturing: boolean,
}

type Props = {
  translate: (string, ?{}) => string,
  onCapture: Function,
  renderFallback: Function,
  isUploadFallbackDisabled: boolean,
  trackScreen: Function,
  documentType: string,
  className: string,
  containerClassName: string,
  renderTitle: Function,
  renderError: Function,
} */

const IDEAL_CAMERA_HEIGHT_IN_PX = 1080
const FALLBACK_HEIGHT_IN_PX = 720

export default class DocumentLiveCapture extends Component {
  webcam = null

  state = {
    hasBecomeInactive: false,
    hasCameraError: false,
    isCapturing: false,
    hasAllowedCameraAccess: false,
  }

  handleUserMediaReady = () => {
    this.setState({ hasAllowedCameraAccess: true })
  }

  handleTimeout = () => this.setState({ hasBecomeInactive: true })

  handleCameraError = () => this.setState({ hasCameraError: true })

  captureDocument = (blob, sdkMetadata) => {
    const documentCapture = {
      blob,
      sdkMetadata,
      filename: `document_capture.${mimeType(blob)}`,
      isPreviewCropped: true,
    }
    this.props.onCapture(documentCapture)
    this.setState({ isCapturing: false })
  }

  captureDocumentPhoto = () => {
    this.setState({ isCapturing: true })
    sendEvent('Taking live photo of document')
    screenshot(this.webcam, this.captureDocument, 'image/jpeg')
  }

  componentWillUnmount() {
    this.setState({ isCapturing: false })
  }

  render() {
    const {
      translate,
      trackScreen,
      renderFallback,
      isUploadFallbackDisabled,
      containerClassName,
      renderTitle,
      documentType,
    } = this.props
    const {
      hasAllowedCameraAccess,
      hasBecomeInactive,
      hasCameraError,
      isCapturing,
    } = this.state
    const id1SizeDocuments = new Set([
      'driving_licence',
      'national_identity_card',
    ])
    const documentSize = id1SizeDocuments.has(documentType)
      ? 'id1Card'
      : 'id3Card'
    return (
      <div className={style.container}>
        {this.state.isCapturing ? (
          <Spinner />
        ) : (
          <Camera
            facing={'environment'}
            docLiveCaptureFrame={true}
            idealCameraHeight={IDEAL_CAMERA_HEIGHT_IN_PX}
            containerClassName={containerClassName}
            renderTitle={renderTitle}
            translate={translate}
            webcamRef={(c) => (this.webcam = c)}
            isUploadFallbackDisabled={isUploadFallbackDisabled}
            trackScreen={trackScreen}
            onUserMedia={this.handleUserMediaReady}
            onError={this.handleCameraError}
            renderFallback={renderFallback}
            renderError={
              hasBecomeInactive ? (
                <CameraError
                  {...{ trackScreen, renderFallback }}
                  error={getInactiveError(isUploadFallbackDisabled)}
                  isDismissible
                />
              ) : null
            }
            buttonType="photo"
            onButtonClick={this.captureDocumentPhoto}
            isButtonDisabled={hasCameraError || isCapturing}
            fallbackHeight={FALLBACK_HEIGHT_IN_PX}
          >
            {hasAllowedCameraAccess && !hasCameraError && (
              <Timeout seconds={10} onTimeout={this.handleTimeout} />
            )}
            <ToggleFullScreen />
            <DocumentOverlay isFullScreen={true} documentSize={documentSize} />
          </Camera>
        )}
      </div>
    )
  }
}
