import { Text, View } from 'react-native';

type ContentBlock =
  | {
      id: string;
      type: 'heading';
      text: string;
    }
  | {
      id: string;
      type: 'paragraph';
      text: string;
    }
  | {
      id: string;
      type: 'bullet';
      text: string;
      marker?: string;
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

function normalizeScrapedText(text: string) {
  return text
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function stripInlineMarkdown(text: string) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/_([^_\n]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*\n]+\*|_[^_\n]+_)/g).filter(Boolean);

  return parts.map((part, index) => {
    const boldMatch = part.match(/^(\*\*|__)(.+)\1$/);
    if (boldMatch) {
      return (
        <Text key={`${part}-${index}`} className="font-beSemiBold text-[#261F1A]">
          {boldMatch[2]}
        </Text>
      );
    }

    const codeMatch = part.match(/^`(.+)`$/);
    if (codeMatch) {
      return (
        <Text key={`${part}-${index}`} className="font-beMedium text-[#261F1A]">
          {codeMatch[1]}
        </Text>
      );
    }

    const italicMatch = part.match(/^(\*|_)(.+)\1$/);
    if (italicMatch) {
      return (
        <Text key={`${part}-${index}`} className="font-beMedium text-[#4F433B]">
          {italicMatch[2]}
        </Text>
      );
    }

    return part;
  });
}

export function getFormattedBlocks(text?: string | null): ContentBlock[] {
  const cleaned = text ? normalizeScrapedText(text).trim() : '';

  if (!cleaned) {
    return [];
  }

  const lines = cleaned.split('\n');
  const blocks: ContentBlock[] = [];
  let paragraphLines: string[] = [];

  const flushParagraph = () => {
    if (!paragraphLines.length) {
      return;
    }

    const paragraph = paragraphLines.join(' ').replace(/\s+/g, ' ').trim();
    if (paragraph) {
      splitLongParagraph(paragraph).forEach((item, index) => {
        blocks.push({
          id: `${blocks.length}-paragraph-${index}`,
          type: 'paragraph',
          text: item.trim(),
        });
      });
    }

    paragraphLines = [];
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      return;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/) ?? line.match(/^(\*\*|__)(.{1,90})(\1)$/);
    if (headingMatch) {
      flushParagraph();
      blocks.push({
        id: `${blocks.length}-heading`,
        type: 'heading',
        text: stripInlineMarkdown(headingMatch[2]),
      });
      return;
    }

    const bulletMatch = line.match(/^([-*])\s+(.+)$/);
    if (bulletMatch) {
      flushParagraph();
      blocks.push({
        id: `${blocks.length}-bullet`,
        type: 'bullet',
        text: bulletMatch[2].trim(),
      });
      return;
    }

    const numberedMatch = line.match(/^(\d+[.)])\s+(.+)$/);
    if (numberedMatch) {
      flushParagraph();
      blocks.push({
        id: `${blocks.length}-numbered`,
        type: 'bullet',
        marker: numberedMatch[1].replace(')', '.'),
        text: numberedMatch[2].trim(),
      });
      return;
    }

    paragraphLines.push(line);
  });

  flushParagraph();

  const seen = new Set<string>();

  return blocks.filter((block) => {
    const fingerprint = stripInlineMarkdown(block.text).toLowerCase().replace(/\s+/g, ' ').trim();

    if (!fingerprint || seen.has(fingerprint)) {
      return false;
    }

    seen.add(fingerprint);
    return true;
  });
}

export function getContentPreview(text?: string | null, maxLength = 190) {
  const firstParagraph = stripInlineMarkdown(getFormattedBlocks(text).find((block) => block.type === 'paragraph')?.text ?? '');

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
        block.type === 'heading' ? (
          <Text key={block.id} className={index === 0 ? 'font-beSemiBold text-sm text-[#261F1A]' : 'mt-4 font-beSemiBold text-sm text-[#261F1A]'}>
            {block.text}
          </Text>
        ) : block.type === 'bullet' ? (
          <View key={block.id} className={index === 0 ? 'flex-row' : 'mt-2.5 flex-row'}>
            {block.marker ? (
              <Text className="mr-2.5 min-w-5 font-beSemiBold text-sm leading-7 text-primary">{block.marker}</Text>
            ) : (
              <View className="mr-3 mt-2.5 h-1.5 w-1.5 rounded-full bg-primary" />
            )}
            <Text className="flex-1 font-beRegular text-sm leading-7 text-[#4F433B]">{renderInlineMarkdown(block.text)}</Text>
          </View>
        ) : (
          <Text key={block.id} className={index === 0 ? 'font-beRegular text-sm leading-7 text-[#4F433B]' : 'mt-4 font-beRegular text-sm leading-7 text-[#4F433B]'}>
            {renderInlineMarkdown(block.text)}
          </Text>
        ),
      )}
    </View>
  );
}
