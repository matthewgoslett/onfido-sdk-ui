import { h, FunctionComponent } from 'preact'
import style from './style.scss'

import type { RecordingSteps } from '~types/docVideo'

type Props = {
  icon?: RecordingSteps
  subtitle?: string
  title: string
}

const Instructions: FunctionComponent<Props> = ({ subtitle, title }) => {
  return (
    <div className={style.instructions}>
      <span className={style.title}>{title}</span>
      {subtitle && <span className={style.subtitle}>{subtitle}</span>}
    </div>
  )
}

export default Instructions
