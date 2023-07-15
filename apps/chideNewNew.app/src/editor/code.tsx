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

  if (language === "js" || language === "jsx")
    language = "javascript";
  else if (language === "ts" || language === "tsx")
    language = "typescript"



  let editor = (<Editor
    height="100vh"
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
  width: calc(100% - 250px);
  margin: 0;
  font-size: 16px;
`
