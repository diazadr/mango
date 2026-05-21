"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo, 
  Heading1, 
  Heading2, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Code,
  Loader2
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/src/lib/http/axios';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MenuBar = ({ editor, disabled }: { editor: any, disabled?: boolean }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL:', previousUrl);
    
    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const res = await api.post('/v1/admin/articles/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const url = res.data.url;
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      console.error("Gagal mengunggah gambar", err);
      alert("Gagal mengunggah gambar. Pastikan ukuran file < 5MB.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50 rounded-t-2xl">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleImageUpload}
      />
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={disabled}
        className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-primary/10 text-primary' : ''}`}
      >
        <Bold size={16} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={disabled}
        className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-primary/10 text-primary' : ''}`}
      >
        <Italic size={16} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={disabled}
        className={`h-8 w-8 p-0 ${editor.isActive('underline') ? 'bg-primary/10 text-primary' : ''}`}
      >
        <UnderlineIcon size={16} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        disabled={disabled}
        className={`h-8 w-8 p-0 ${editor.isActive('heading', { level: 1 }) ? 'bg-primary/10 text-primary' : ''}`}
      >
        <Heading1 size={16} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        disabled={disabled}
        className={`h-8 w-8 p-0 ${editor.isActive('heading', { level: 2 }) ? 'bg-primary/10 text-primary' : ''}`}
      >
        <Heading2 size={16} />
      </Button>
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={disabled}
        className={`h-8 w-8 p-0 ${editor.isActive('bulletList') ? 'bg-primary/10 text-primary' : ''}`}
      >
        <List size={16} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={disabled}
        className={`h-8 w-8 p-0 ${editor.isActive('orderedList') ? 'bg-primary/10 text-primary' : ''}`}
      >
        <ListOrdered size={16} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        disabled={disabled}
        className={`h-8 w-8 p-0 ${editor.isActive('blockquote') ? 'bg-primary/10 text-primary' : ''}`}
      >
        <Quote size={16} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        disabled={disabled}
        className={`h-8 w-8 p-0 ${editor.isActive('codeBlock') ? 'bg-primary/10 text-primary' : ''}`}
      >
        <Code size={16} />
      </Button>
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={addLink}
        disabled={disabled}
        className={`h-8 w-8 p-0 ${editor.isActive('link') ? 'bg-primary/10 text-primary' : ''}`}
      >
        <LinkIcon size={16} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isUploading}
        className="h-8 w-8 p-0"
      >
        {isUploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
      </Button>
      <div className="flex-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={disabled || !editor.can().undo()}
        className="h-8 w-8 p-0"
      >
        <Undo size={16} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={disabled || !editor.can().redo()}
        className="h-8 w-8 p-0"
      >
        <Redo size={16} />
      </Button>
    </div>
  );
};

export const TiptapEditor = ({ content, onChange, placeholder, disabled }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-4 font-bold',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-2xl border border-border shadow-sm max-w-full my-6 mx-auto block',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Tulis konten artikel di sini...',
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[300px] p-6 prose prose-slate dark:prose-invert max-w-none',
      },
    },
    immediatelyRender: false,
  });

  // Sync content if it changes externally (e.g. from the form reset)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Only update if content is actually different to avoid cursor jumps
      // We also handle the case where content is empty/undefined
      const newContent = content || '';
      if (newContent !== editor.getHTML()) {
        editor.commands.setContent(newContent);
      }
    }
  }, [content, editor]);

  return (
    <div className={`border rounded-2xl bg-muted/30 focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden flex flex-col ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <MenuBar editor={editor} disabled={disabled} />
      <EditorContent editor={editor} />
      <style jsx global>{`
        .tiptap p.is-editor-empty:first-child::before {
          color: #94a3b8;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
          font-weight: 500;
        }
        .tiptap {
          outline: none !important;
        }
        .tiptap p {
          margin: 1rem 0;
          line-height: 1.75;
          font-weight: 500;
        }
        .tiptap h1 {
          font-size: 1.875rem;
          font-weight: 800;
          margin-top: 2rem;
          margin-bottom: 1rem;
          line-height: 1.2;
        }
        .tiptap h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }
        .tiptap ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        .tiptap ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        .tiptap li {
          margin: 0.5rem 0;
        }
        .tiptap blockquote {
          border-left: 4px solid var(--primary);
          padding-left: 1.25rem;
          font-style: italic;
          color: #64748b;
          margin: 1.5rem 0;
          background: rgba(var(--primary-rgb), 0.05);
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
        }
        .tiptap code {
          background-color: #f1f5f9;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.9em;
        }
        .dark .tiptap code {
          background-color: #1e293b;
        }
      `}</style>
    </div>
  );
};
