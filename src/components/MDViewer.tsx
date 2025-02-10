import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import remarkGfm from "remark-gfm";
import Image from "next/image";

interface MDViewerProps {
  content: string;
}

const MDViewer: React.FC<MDViewerProps> = ({ content }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => (
            <h1 className="text-4xl font-bold mt-8 mb-4" {...props} />
          ),
          h2: (props) => (
            <h2 className="text-3xl font-bold mt-6 mb-3" {...props} />
          ),
          h3: (props) => (
            <h3 className="text-2xl font-semibold mt-4 mb-2" {...props} />
          ),
          p: ({ node, children, ...props }) => {
            if (
              node?.children?.length === 1 &&
              ((node.children[0] as any)?.tagName === "img")
            ) {
              return <>{children}</>;
            }
            return (
              <p className="text-lg mb-4" {...props}>
                {children}
              </p>
            );
          },
          ul: (props) => (
            <ul className="list-disc list-inside mb-4" {...props} />
          ),
          ol: (props) => (
            <ol className="list-decimal list-inside mb-4" {...props} />
          ),
          li: (props) => <li className="mb-2" {...props} />,
          a: (props) => (
            <a className="text-blue-600 hover:underline" {...props} />
          ),
          img: (props) => (
            <div className="my-8">
              <Image
                src={props.src || ""}
                alt={props.alt || "Markdown Image"}
                width={800}
                height={450}
                className="rounded-lg shadow-lg mx-auto"
              />
            </div>
          ),
          code({ className, children, ...props }) {
            const match = className?.match(/language-(\w+)/);
            return match ? (
              <div className="my-8">
                <SyntaxHighlighter
                  language={match[1]}
                  PreTag="div"
                  className="rounded-lg shadow-lg"
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                className="bg-gray-100 rounded px-1 py-0.5"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MDViewer;
