import { GLOSSARY } from '@/lib/constants';

/**
 * Plain-language gloss on first use of jargon (NFR-U2).
 * Renders as an <abbr> with a title plus a visible dotted underline, so the explanation is available on
 * hover, focus and to screen readers.
 */
export function Term({ children, term }: { children?: React.ReactNode; term: keyof typeof GLOSSARY | string }) {
  const explanation = GLOSSARY[term];
  const label = children ?? term;
  if (!explanation) return <>{label}</>;

  return (
    <abbr
      title={explanation}
      tabIndex={0}
      className="cursor-help underline decoration-dotted decoration-from-font underline-offset-2"
    >
      {label}
    </abbr>
  );
}
