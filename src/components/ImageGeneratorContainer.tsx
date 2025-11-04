import React from 'react';

const ImageGeneratorContainer: React.FC = () => {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Image Generation</h2>
      <div className="flex">
        <input
          type="text"
          className="w-full p-2 text-white bg-gray-800 rounded"
          placeholder="Enter a prompt for the image..."
        />
        <button className="px-4 py-2 ml-2 bg-blue-600 rounded">Generate</button>
      </div>
    </div>
  );
};

export default ImageGeneratorContainer;
