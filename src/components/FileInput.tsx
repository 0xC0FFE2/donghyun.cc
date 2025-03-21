import React from "react";

interface FileInputProps {
  onFileChange: (file: File | null) => void;
}

const FileInput: React.FC<FileInputProps> = ({ onFileChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(e.target.files ? e.target.files[0] : null);
  };

  return (
    <div>
      <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
        파일 선택
      </label>
      <input
        id="file-upload"
        type="file"
        onChange={handleChange}
        className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
      />
    </div>
  );
};

export default FileInput;
