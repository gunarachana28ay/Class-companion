import { React, useCallback, useMemo } from "react";
import ProfilePicDisplay from "./ProfilePicDisplay"

const FileSelector = ({ supportedTypes, selectedFileName, onFileChange, previewUrl }) => {
    const supportedTypeText = useMemo(() => {
        if (!supportedTypes?.length) return ""
        else if (supportedTypes.length == 1) return supportedTypes[0]
        else {
            let finalStr = "";
            supportedTypes.forEach((type, i) => {
                if (i == supportedTypes.length - 1) {
                    finalStr += type;
                } else if (i == supportedTypes.length - 2) {
                    finalStr += (type + " or ");
                } else {
                    finalStr += (type += ", ");
                }
            })
            return finalStr
        }
    }, [supportedTypes])

    const handleChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            onFileChange(file);
        } else {
            onFileChange(null);
        }
    }, [onFileChange])

    return (
        <div className="flex items-center justify-center w-full">
            <label for="dropzone-file" className={`relative flex flex-col items-center justify-center w-full h-64 rounded-lg cursor-pointer ${previewUrl ? "" : "border-dashed border-2 border-gray-300 bg-gray-50 hover:bg-gray-100"}`}>
                {previewUrl ?
                    <ProfilePicDisplay previewUrl={previewUrl} />
                    :
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {
                            selectedFileName ?
                                <p className="text-xs text-gray-500">{selectedFileName}</p> :
                                <>
                                    <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                    </svg>
                                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-gray-500">{supportedTypeText}</p>
                                </>
                        }
                    </div>
                }
                <input id="dropzone-file" type="file" className="absolute h-full w-full opacity-0" onChange={handleChange} />
            </label>
        </div>
    )
}

export default FileSelector;