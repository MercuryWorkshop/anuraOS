import React, { useState } from "react";
import Sidebar from "./components/sidebar";
import { useFilesFromSandbox } from "./utils";
import { Code } from "./editor/code";
import styled from "@emotion/styled";
import { Type, File, Directory, findFileByName } from "./utils/file-manager";
import "./App.css";
import { FileTree } from "./components/file-tree";

const CURRENT_SANDBOX_ID = "ww9kis";

const dummyDir: Directory = {
  id: "1",
  name: "loading...",
  type: Type.DUMMY,
  parentId: undefined,
  depth: 0,
  dirs: [],
  files: []
};

const App = () => {
  const [rootDir, setRootDir] = useState(dummyDir);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  useFilesFromSandbox(CURRENT_SANDBOX_ID, (root) => {
    if (!selectedFile) {
      setSelectedFile(findFileByName(root, "index.tsx"));
    }
    setRootDir(root);
  });

  const onSelect = (file: File) => {
    setSelectedFile(file)
  };

  return (
    <div>
      <Main>
        <Sidebar>
          <FileTree
            rootDir={rootDir}
            selectedFile={selectedFile}
            onSelect={onSelect}
          />
        </Sidebar>
        <div style={{ height: "100vh", width: "100%", display: "flex", flexDirection: "column" }}>
          <Code selectedFile={selectedFile} />
          <iframe src="/apps/term.app/term.html" style={{ width: "100%", border: "none" }}>

          </iframe>
        </div>
      </Main>
    </div>
  );
};

const Main = styled.main`
  display: flex;
`;

export default App;
