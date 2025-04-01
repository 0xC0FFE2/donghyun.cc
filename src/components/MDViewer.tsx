import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nord } from "react-syntax-highlighter/dist/cjs/styles/prism";
import remarkGfm from "remark-gfm";
import Image from "next/image";

interface MDViewerProps {
  content: string;
}

const MDViewer: React.FC<MDViewerProps> = ({ content }) => {
  const processedContent = content.replace(/^(\s*\*\s*)- -/gm, '$1\u00A0\u00A0\u00A0\u00A0');

  return (
    <div className="max-w-3xl mx-auto prose prose-lg">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => (
            <h1 className="text-4xl font-bold mt-10 mb-6 border-b pb-2 border-gray-200" {...props} />
          ),
          h2: (props) => (
            <h2 className="text-3xl font-bold mt-8 mb-4 border-b pb-1 border-gray-200" {...props} />
          ),
          h3: (props) => (
            <h3 className="text-2xl mt-6 mb-3" {...props} />
          ),
          p: ({ node, children, ...props }) => {
            if (
              node?.children?.length === 1 &&
              ((node.children[0] as any)?.tagName === "img")
            ) {
              return <>{children}</>;
            }
            return (
              <p className="text-lg leading-relaxed my-4" {...props}>
                {children}
              </p>
            );
          },
          ul: (props) => (
            <ul className="list-disc list-outside pl-5 my-6 space-y-2" {...props} />
          ),
          ol: (props) => (
            <ol className="list-decimal list-outside pl-5 my-6 space-y-2" {...props} />
          ),
          li: (props) => <li className="mb-1 pl-1" {...props} />,
          a: (props) => (
            <a 
              className="text-blue-600 font-medium underline decoration-1 underline-offset-2 hover:text-blue-800 transition-colors duration-200" 
              {...props} 
            />
          ),
          img: (props) => (
            <div className="my-10 overflow-hidden rounded-lg">
              <Image
                src={props.src || ""}
                alt={props.alt || "Markdown Image"}
                width={800}
                height={450}
                className="rounded-lg mx-auto"
              />
            </div>
          ),
          code({ className, children, ...props }) {
            const match = className?.match(/language-(\w+)/);
            return match ? (
              <div className="my-8 overflow-hidden rounded-lg border border-gray-200">
                <SyntaxHighlighter
                  language={match[1]}
                  style={nord}
                  PreTag="div"
                  className="rounded-lg text-base"
                  showLineNumbers
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                className="bg-yellow-200 font"
                {...props}
              >
                {children}
              </code>
            );
          },
          blockquote: (props) => (
            <blockquote 
              className="pl-4 italic border-l-4 border-gray-300 bg-gray-50 my-6 py-2 rounded-r-sm" 
              {...props}
            />
          ),
          hr: () => <hr className="my-10 border-none" />,
          table: (props) => (
            <div className="overflow-x-auto my-8">
              <table className="min-w-full border-collapse" {...props} />
            </div>
          ),
          thead: (props) => <thead className="bg-gray-50" {...props} />,
          th: (props) => (
            <th 
              className="py-3 px-4 text-left font-semibold border-b border-gray-200" 
              {...props} 
            />
          ),
          td: (props) => (
            <td className="py-2 px-4 border-b border-gray-200" {...props} />
          ),
          tr: (props) => <tr className="hover:bg-gray-50" {...props} />,
          em: (props) => <em className="italic" {...props} />,
          strong: (props) => <strong className="font-bold" {...props} />,
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MDViewer;