"use client";
// InitializedMDXEditor.tsx
import "@mdxeditor/editor/style.css";
import type { ForwardedRef } from "react";

import {
  BoldItalicUnderlineToggles,
  codeBlockPlugin,
  CodeToggle,
  headingsPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
  type MDXEditorMethods,
  type MDXEditorProps,
} from "@mdxeditor/editor";
import { cn } from "@/lib/utils";

// Only import this to the next file
export default function InitializedMDXEditor({
  editorRef,
  className,
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  return (
    <MDXEditor
      className={cn(
        "background-light800_dark200 light-border-2 markdown-editor dark-editor w-full border",
        className,
      )}
      plugins={[
        // Example Plugin Usage
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        codeBlockPlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <UndoRedo />
              <BoldItalicUnderlineToggles />
              <CodeToggle />
            </>
          ),
        }),
      ]}
      {...props}
      ref={editorRef}
    />
  );
}
