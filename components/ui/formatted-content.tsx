import { Text, View } from 'react-native';

type ContentBlock =
  | {
      id: string;
      type: 'paragraph';
      text: string;
    }
  | {
      id: string;
      type: 'bullet';
      text: string;
    };

type FormattedContentProps = {
  text?: string | null;
  emptyText?: string;
};

function splitLongParagraph(text: string) {
  const sentences = text.match(/[^.!?]+[.!?]+(?:["']+)?|[^.!?]+$/g);

  if (!sentences || sentences.length <= 1) {
    return [text];
  }

  const paragraphs: string[] = [];
  let current = '';

  sentences.forEach((sentence) => {
    const cleanSentence = sentence.trim();
    const next = current ? `${current} ${cleanSentence}` : cleanSentence;

    if (current && next.length > 360) {
      paragraphs.push(current);
      current = cleanSentence;
      return;
    }

    current = next;
  });

  if (current) {
    paragraphs.push(current);
  }

  return paragraphs;
}

export function getFormattedBlocks(text?: string | null): ContentBlock[] {
  const cleaned = text?.replace(/\r/g, '').trim();

  if (!cleaned) {
    return [];
  }

  const lines = cleaned
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const blocks = lines.flatMap<ContentBlock>((line, lineIndex) => {
    const bulletMatch = line.match(/^(\d+[.)]|[-*])\s+(.+)$/);

    if (bulletMatch) {
      return [
        {
          id: `${lineIndex}-bullet`,
          type: 'bullet' as const,
          text: bulletMatch[2].trim(),
        },
      ];
    }

    return splitLongParagraph(line).map((paragraph, paragraphIndex) => ({
      id: `${lineIndex}-${paragraphIndex}`,
      type: 'paragraph' as const,
      text: paragraph,
    }));
  });

  const seen = new Set<string>();

  return blocks.filter((block) => {
    const fingerprint = block.text.toLowerCase().replace(/\s+/g, ' ').trim();

    if (!fingerprint || seen.has(fingerprint)) {
      return false;
    }

    seen.add(fingerprint);
    return true;
  });
}

export function getContentPreview(text?: string | null, maxLength = 190) {
  const firstParagraph = getFormattedBlocks(text).find((block) => block.type === 'paragraph')?.text;

  if (!firstParagraph) {
    return '';
  }

  if (firstParagraph.length <= maxLength) {
    return firstParagraph;
  }

  const clipped = firstParagraph.slice(0, maxLength).trimEnd();
  return `${clipped.replace(/[,.!?;:]+$/, '')}...`;
}

export function FormattedContent({ text, emptyText = 'No content provided.' }: FormattedContentProps) {
  const blocks = getFormattedBlocks(text);

  if (!blocks.length) {
    return <Text className="font-beRegular text-sm leading-7 text-[#4F433B]">{emptyText}</Text>;
  }

  return (
    <View>
      {blocks.map((block, index) =>
        block.type === 'bullet' ? (
          <View key={block.id} className={index === 0 ? 'flex-row' : 'mt-3 flex-row'}>
            <View className="mr-3 mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
            <Text className="flex-1 font-beRegular text-sm leading-7 text-[#4F433B]">{block.text}</Text>
          </View>
        ) : (
          <Text key={block.id} className={index === 0 ? 'font-beRegular text-sm leading-7 text-[#4F433B]' : 'mt-4 font-beRegular text-sm leading-7 text-[#4F433B]'}>
            {block.text}
          </Text>
        ),
      )}
    </View>
  );
}
