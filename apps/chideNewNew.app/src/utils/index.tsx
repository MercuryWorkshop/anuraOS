import React from 'react'
import { buildFileTree, Directory } from "./file-manager";

export const useFilesFromSandbox = (id: string, callback: (dir: Directory) => void) => {
  React.useEffect(() => {
    fetch('https://codesandbox.io/api/v1/sandboxes/' + id)
      .then(response => response.json())
      .then(async ({ data }) => {
        console.log(data);
        const rootDir = await buildFileTree(data);
        callback(rootDir)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
