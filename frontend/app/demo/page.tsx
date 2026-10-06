import type { Metadata } from 'next';
import { GuidedDemo } from '@/components/demo/GuidedDemo';

export const metadata: Metadata = {
  title: 'Guided solar decision demo',
  description: 'Try RoofToGrid with your own bill and roof details—no account required.',
  alternates: { canonical: '/demo' },
};

export default function DemoPage() {
  return <GuidedDemo />;
}
