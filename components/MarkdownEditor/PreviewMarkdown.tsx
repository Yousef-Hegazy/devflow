import { cn } from "@/lib/utils";
import { Code } from "bright";
import { MDXRemote } from "next-mdx-remote-client/rsc";

Code.theme = {
  light: "github-light",
  dark: "github-dark",
  lightSelector: "html.light",
};

type Props = {
  content: string;
  isCompact?: boolean;
};

const PreviewMarkdown = ({ content, isCompact }: Props) => {
  const formattedContent = content.replace(/\\/g, "").replace(/&#x20;/g, "");

  return (
    <section className={cn("markdown prose grid wrap-break-word", {
      "line-clamp-1": isCompact,
    })}>
      <MDXRemote
        source={formattedContent}
        components={{
          pre: (props) => (
            <Code
              {...props}
              lineNumbers
              className={cn("shadow-light-200 dark:shadow-dark-200", {
                "line-clamp-1": isCompact,
              })}
            />
          ),
        }}
      />
    </section>
  );
};

export default PreviewMarkdown;
