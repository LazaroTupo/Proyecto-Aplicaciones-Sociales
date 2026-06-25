'use client';

import dynamic from 'next/dynamic';
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
});

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function RichTextEditor({ value, onChange }: Props) {
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      placeholder="Detalla y explica tu proyecto"
    />
  );
}