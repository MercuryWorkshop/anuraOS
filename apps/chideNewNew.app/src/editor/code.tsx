import React from 'react'
import Editor from "@monaco-editor/react";
import { File } from "../utils/file-manager";
import styled from "@emotion/styled";
//@ts-ignore
import Filer from "filer";


import { useState } from "react";
export const Code = ({ selectedFile }: { selectedFile: File | undefined }) => {

  const [code, setCode] = useState<any>("loading...");
  if (!selectedFile)
    return null



  let language = selectedFile.name.split('.').pop()

  switch (language) {
    case "js":
    case "jsx":
      language = "javascript"
      break;
    case "ts":
    case "tsx":
      language = "javascript"
      break;
    case "sh":
      language = "shell"
      break;
    case "htm":
    case "html":
      language = "html"
      break;
    case "c":
      language = "c"
      break;
    case "cpp":
      language = "cpp"
      break;
    case "css":
      language = "css"
      break;
  }


  let editor = (<Editor
    height="100%"
    language={language}
    value={code}
    theme="vs-dark"
    onChange={(value) => {
      Filer.fs.writeFile(selectedFile.id, value)
    }}
  />)


  let decoder = new TextDecoder();
  Filer.fs.readFile(selectedFile.id, (file: any, b: any) => setCode(decoder.decode(b)));
  return (
    <Div>
      {editor}

    </Div>
  )
}

const Div = styled.div`
  width: calc(100%);
  height: 100%;
  margin: 0;
  font-size: 16px;
`
