"use client";
import { useState } from "react";

interface IdentifiedObject {
  label: string;
  mask: string;
  score: number;
}

export default function Home() {
  const [theFile, setTheFile] = useState<File | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<IdentifiedObject[]>([]);
  const [toShow, setToShow] = useState<IdentifiedObject | undefined>(undefined);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Make sure we have a file
    const file = event.currentTarget.files?.[0];
    if (!file) return;
  
    // Update the state variable accordingly
    setTheFile(file);
  
    // Get the file's data url and set it as the image preview
    const blobUrl = URL.createObjectURL(file);
    setImagePreview(blobUrl);
  };

  const identifyThings = async () => {
    // ensuring we have the file
    if (!theFile) return;

    // start the loading indicator
    setIsLoading(true);
    // prepare data to send to the backend
    const formData = new FormData();
    formData.set("theImage", theFile);

    try {
      // Call the backend API which further calls Hugging face
      const response = await fetch("/api", {
        method: "POST",
        body: formData,
      });

      // If the API call was successful, set the response
      if (response.ok) {
        console.log("File uploaded successfuly");
        const theResponse = await response.json();
        console.log(theResponse);
        setApiResponse(theResponse.body);
      } else {
        console.error("Failed to upload the file");
      }
    } catch (error) {
      console.error("Error occured during the API call", error);
    }

    setIsLoading(false);
  };

  function toggleThis(label: string) {
    const showThis = apiResponse.find((obj) => obj.label === label);
    setToShow((prev: IdentifiedObject | undefined) => {
      if (prev === showThis) {
        return undefined;
      }
      return showThis || undefined;
    });
  }

  return (
    <main className="flex min-h-screen bg-white-600 flex-col items-center justify-between px-24 py-12">
      <h1 className=" text-5xl mb-4">AI-dentifier</h1>
      <div className="mb-4">
        This is a project that uses Facebook's DEtection TRansformer (DETR)
        model trained end-to-end on COCO 2017 panoptic (118k annotated images).
      </div>
      <div className="items-center">Contributor: Ebbie Aden</div>
      <input
        type="file"
        className="border p-2 rounded-sm border-gray-600"
        onChange={handleFileChange}
        accept=".jpg, .jpeg, .png"
      />
      <div className="w-80 h-80 relative placeholderdiv">
        {imagePreview && (
          <img src={imagePreview} className=" object-contain absolute z-0" />
        )}
        {toShow ? (
          <img
            src={`data:image/png;base64,${toShow.mask}`}
            className="object-contain absolute z-20 mix-blend-screen invert"
          />
        ) : (
          ""
        )}
      </div>
      {theFile ? (
        <button
          className="bg-blue-600 px-5 py-1 rounded-sm disabled:cursor-not-allowed disabled:bg-blue-900 transition-colors"
          onClick={identifyThings}
          disabled={isLoading}
        >
          {isLoading ? "loading..." : "Go!"}
        </button>
      ) : (
        ""
      )}
      {apiResponse?(
        <div className="mt-12 ">
          <div className="mb-4">Identified objects: </div>
          <div className="flex"> 
            {
            apiResponse.map((e) => (
              
              <div className="mx-2" key={e.label}>
                <button className="px-4 py-1 bg-blue-600 rounded-md" onClick={() => toggleThis(e.label)}>{e.label}</button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        ""
      )}
    </main>
  );
}