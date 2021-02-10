import { h, FunctionComponent } from 'preact'
import { memo, useCallback, useContext, useState } from 'preact/compat'

import { LocaleContext } from '~locales'
import Instructions from './Instructions'
import Recording from './Recording'
import StartRecording from './StartRecording'
import style from './style.scss'

import { TILT_MODE, CaptureSteps } from '~types/docVideo'
import type { VideoLayerProps } from '../VideoCapture'

export type Props = {
  onNext: () => void
  step: CaptureSteps
  stepNumber: number
  subtitle: string
  title: string
  totalSteps: number
} & VideoLayerProps

const VideoLayer: FunctionComponent<Props> = ({
  disableInteraction,
  isRecording,
  onNext,
  onStart,
  onStop,
  step,
  stepNumber,
  subtitle,
  title,
  totalSteps,
}) => {
  const [shouldShowSuccess, showSuccessState] = useState(false)
  const { translate } = useContext(LocaleContext)

  const handleNext = useCallback(() => {
    if (step === 'intro') {
      onNext()
      return
    }

    showSuccessState(true)

    setTimeout(() => {
      showSuccessState(false)
      onNext()
    }, 1000)
  }, [step, onNext])

  if (!isRecording) {
    return (
      <StartRecording disableInteraction={disableInteraction} onClick={onStart}>
        <Instructions title={title} />
      </StartRecording>
    )
  }

  if (shouldShowSuccess) {
    return <span className={style.success} />
  }

  return (
    <Recording
      buttonText={translate(
        step !== 'back'
          ? 'doc_video_capture.button_primary_next'
          : 'doc_video_capture.button_stop_accessibility'
      )}
      disableInteraction={disableInteraction}
      hasMoreSteps={stepNumber < totalSteps}
      onNext={handleNext}
      onStop={onStop}
    >
      <Instructions
        icon={step}
        subtitle={subtitle}
        tiltMode={TILT_MODE}
        title={title}
      />
    </Recording>
  )
}

export default memo(VideoLayer)
