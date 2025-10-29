'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useCallback, useState } from 'react';
import { EditorToolbar } from './editor-toolbar';
import { useDebounce } from '@/hooks/use-debounce';

interface DocumentEditorProps {
  fileId: string;
  initialContent: string;
  title: string;
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  editable?: boolean;
}

export function DocumentEditor({
  initialContent,
  title,
  onContentChange,
  onTitleChange,
  editable = true,
}: DocumentEditorProps) {
  const [localTitle, setLocalTitle] = useState(title);
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
    ],
    content: initialContent,
    editable,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert mx-auto focus:outline-none min-h-[calc(100vh-200px)] px-8 py-4',
      },
    },
    onUpdate: ({ editor }) => {
      setIsSaving(true);
      onContentChange(editor.getHTML());
    },
  });

  const debouncedContent = useDebounce(initialContent, 1000);

  useEffect(() => {
    if (debouncedContent) {
      setIsSaving(false);
    }
  }, [debouncedContent]);

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalTitle(e.target.value);
      onTitleChange(e.target.value);
    },
    [onTitleChange]
  );

  return (
    <div className="flex size-full flex-col">
      <div className="border-b px-8 py-4">
        <input
          type="text"
          value={localTitle}
          onChange={handleTitleChange}
          className="w-full border-none bg-transparent text-4xl font-bold outline-none placeholder:text-muted-foreground"
          placeholder="Untitled"
          disabled={!editable}
        />
        {isSaving && (
          <p className="mt-2 text-sm text-muted-foreground">Saving...</p>
        )}
      </div>

      {editable && <EditorToolbar editor={editor} />}

      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
