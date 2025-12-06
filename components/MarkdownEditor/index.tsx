"use client";

import { type MDXEditorMethods, type MDXEditorProps } from "@mdxeditor/editor";
import dynamic from "next/dynamic";
import { forwardRef } from "react";

// This is the only place InitializedMDXEditor is imported directly.
const Editor = dynamic(() => import("./initializeEditor"), {
  // Make sure we turn SSR off
  ssr: false,
});

// This is what is imported by other components. Pre-initialized with plugins, and ready
// to accept other props, including a ref.
const ForwardRefEditor = forwardRef<MDXEditorMethods, MDXEditorProps>(
  (props, ref) => <Editor {...props} editorRef={ref} />,
);

// TS complains without the following line
ForwardRefEditor.displayName = "ForwardRefEditor";

export default ForwardRefEditor;
