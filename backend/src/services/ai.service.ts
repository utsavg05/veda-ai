import type { AssignmentDocument } from '../models/assignment.model.js';
import type { GeneratedResultPayload, QuestionDifficulty } from '../types/assignment.types.js';
import { buildAssessmentPrompt } from './prompt.service.js';

const difficultyCycle: QuestionDifficulty[] = ['easy', 'medium', 'hard'];

const toSectionInstruction = (assignment: AssignmentDocument): string => {
  return assignment.instructions?.trim()
    ? `Follow the teacher's instructions carefully. ${assignment.instructions.trim()}`
    : 'Attempt all questions and present answers neatly.';
};

const formatQuestionTypeLabel = (value: string): string => {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

export const generateAssessment = async (
  assignment: AssignmentDocument,
): Promise<GeneratedResultPayload> => {
  const prompt = buildAssessmentPrompt(assignment);
  void prompt;

  const sections = assignment.questionTypes.map((questionType, sectionIndex) => {
    const questions = Array.from({ length: questionType.count }, (_value, questionIndex) => ({
      text: `${formatQuestionTypeLabel(questionType.type)} question ${questionIndex + 1} on ${assignment.subject} for class ${assignment.className}`,
      difficulty: difficultyCycle[(sectionIndex + questionIndex) % difficultyCycle.length],
      marks: questionType.marks,
    }));

    return {
      title: `Section ${String.fromCharCode(65 + sectionIndex)}: ${formatQuestionTypeLabel(questionType.type)}`,
      instruction: toSectionInstruction(assignment),
      questions,
    };
  });

  const totalMarks = sections.reduce((sectionTotal, section) => {
    return sectionTotal + section.questions.reduce((questionTotal, question) => questionTotal + question.marks, 0);
  }, 0);

  return {
    assignment: assignment._id,
    schoolName: 'Veda AI School',
    subject: assignment.subject,
    className: assignment.className,
    totalMarks,
    sections,
  };
};