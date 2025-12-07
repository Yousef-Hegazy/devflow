"use client";
// InitializedMDXEditor.tsx
import "@mdxeditor/editor/style.css";
import "./dark-editor.css"
import type { ForwardedRef } from "react";

import { cn } from "@/lib/utils";
import {
  BoldItalicUnderlineToggles,
  ChangeCodeMirrorLanguage,
  codeBlockPlugin,
  codeMirrorPlugin,
  CodeToggle,
  ConditionalContents,
  CreateLink,
  diffSourcePlugin,
  headingsPlugin,
  imagePlugin,
  InsertCodeBlock,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  Separator,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
  type MDXEditorMethods,
  type MDXEditorProps,
} from "@mdxeditor/editor";
import { basicDark } from "cm6-theme-basic-dark";
import { useTheme } from "next-themes";

// Only import this to the next file
export default function InitializedMDXEditor({
  editorRef,
  className,
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  const { resolvedTheme } = useTheme();

  const themeExtension = resolvedTheme === "dark" ? [basicDark] : [];
  return (
    <MDXEditor
      className={cn(
        "background-light800_dark200 light-border-2 markdown-editor dark-editor w-full border grid",
        className,
      )}
      plugins={[
        // Example Plugin Usage
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        tablePlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        imagePlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
        codeMirrorPlugin({
          codeBlockLanguages: {
            css: "css",
            txt: "txt",
            sql: "sql",
            html: "html",
            js: "javascript",
            ts: "typescript",
            sass: "sass",
            scss: "scss",
            bash: "bash",
            json: "json",
            jsx: "jsx",
            tsx: "tsx",
            "": "unspecified",
          },
          autoLoadLanguageSupport: true,
          codeMirrorExtensions: themeExtension,
        }),
        diffSourcePlugin({
          viewMode: "rich-text",
          diffMarkdown: ""
        }),
        toolbarPlugin({
          toolbarContents: () => (
            <ConditionalContents
              options={[
                {
                  when: (editor) => editor?.editorType === "codeblock",
                  contents: () => <ChangeCodeMirrorLanguage />,
                },
                {
                  fallback: () => (
                    <>
                      <UndoRedo />

                      <Separator />

                      <BoldItalicUnderlineToggles />

                      <Separator />

                      <ListsToggle />

                      <Separator />

                      <CreateLink />

                      <InsertImage />

                      <Separator />

                      <InsertTable />

                      <InsertThematicBreak />

                      <Separator />

                      <InsertCodeBlock />

                      <CodeToggle />
                    </>
                  ),
                },
              ]}
            />
          ),
        }),
        // toolbarPlugin({
        //   toolbarContents: () => (
        //     <>
        //       <UndoRedo />
        //       <BoldItalicUnderlineToggles />
        //       <CodeToggle />
        //     </>
        //   ),
        // }),
      ]}
      {...props}
      ref={editorRef}
    />
  );
}
