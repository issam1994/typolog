import type { ComponentType } from "react";
import type { ResultTemplate } from "@/types/shared/quiz";
import {
  BarsTemplate,
  MbtiCodeTemplate,
  EnneagramTypeTemplate,
  CognitiveStackTemplate,
  PsychosophyStackTemplate,
  type ResultTemplateProps,
} from "./templates";

const TEMPLATES: Record<ResultTemplate, ComponentType<ResultTemplateProps>> = {
  bars: BarsTemplate,
  mbti_code: MbtiCodeTemplate,
  enneagram_type: EnneagramTypeTemplate,
  cognitive_stack: CognitiveStackTemplate,
  psychosophy_stack: PsychosophyStackTemplate,
};

export default function ResultsDisplay(props: ResultTemplateProps) {
  const Template = TEMPLATES[props.test.result_template];
  return <Template {...props} />;
}
