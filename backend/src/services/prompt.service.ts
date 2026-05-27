import type { AssignmentInput } from '../types/assignment.types';

export const buildAssessmentPrompt = (assignment: AssignmentInput): string => {
  const questionTypeSummary = assignment.questionTypes
    .map((questionType) => `${questionType.type} (${questionType.count} x ${questionType.marks} marks)`)
    .join(', ');

  const instructionBlock = assignment.instructions?.trim() || 'No additional instructions provided.';

  return [
    'You are an expert exam paper generator.',
    `Create a structured assessment for ${assignment.subject} for class ${assignment.className}.`,
    `Assignment title: ${assignment.title}.`,
    `Question types required: ${questionTypeSummary}.`,
    `Due date: ${assignment.dueDate.toISOString()}.`,
    `Teacher instructions: ${instructionBlock}.`,
    'Return only structured JSON data for sections, questions, difficulty, and marks.',
    'Do not return raw prose or markdown.',
  ].join(' ');
};