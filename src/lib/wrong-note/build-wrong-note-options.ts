import type { OptionState } from '@/schemas/wrong-note.schema';

interface QuestionOptionsSource {
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  answer: string;
}

export function buildWrongNoteOptions(question: QuestionOptionsSource, selectedAnswer: number) {
  const optionTexts = [question.option_1, question.option_2, question.option_3, question.option_4];

  return optionTexts.map((text, index) => {
    const number = index + 1;
    const state: OptionState =
      text === question.answer ? 'correct' : number === selectedAnswer ? 'my_wrong' : 'neutral';

    return { number, text, state };
  });
}
