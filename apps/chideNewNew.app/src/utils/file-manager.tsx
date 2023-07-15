export enum Type {
  FILE, // 文件
  DIRECTORY, // 目录
  DUMMY // 虚拟文件（用于未成功获取到文件时展示）
}

interface CommonProps {
  id: string; // 文件id
  type: Type; // 文件类型
  name: string; // 名称
  parentId: string | undefined; // 父级目录，如果为根目录则undefined
  depth: number; // 文件深度
}

export interface File extends CommonProps {
  content: string; // 文件内容
}

export interface Directory extends CommonProps {
  files: File[];
  dirs: Directory[];
}

/**
 * 构建文件树
 * @param data fetch获取的结果
 */
export function buildFileTree(data: any): Directory {
  const dirs = [...data.directories]; // 目录数组
  const files = [...data.modules]; // 文件数组
  const cache = new Map<string, Directory | File>(); // 缓存
  // 待构建的根目录
  let rootDir: Directory = {
    id: "0",
    name: "root",
    parentId: undefined,
    type: Type.DIRECTORY,
    depth: 0,
    dirs: [],
    files: []
  };
  // 将<id，目录对象>存入map
  dirs.forEach((item) => {
    let dir: Directory = {
      id: item.shortid,
      name: item.title,
      parentId: item.directory_shortid === null ? "0" : item.directory_shortid,
      type: Type.DIRECTORY,
      depth: 0,
      dirs: [],
      files: []
    };

    cache.set(dir.id, dir);
  });
  // 将<id，文件对象>存入map
  files.forEach((item) => {
    let file: File = {
      id: item.shortid,
      name: item.title,
      parentId: item.directory_shortid === null ? "0" : item.directory_shortid,
      type: Type.FILE,
      depth: 0,
      content: item.code
    };
    cache.set(file.id, file);
  });
  // 开始遍历构建文件树
  cache.forEach((value, key) => {
    // '0'表示文件或目录位于根目录
    if (value.parentId === "0") {
      if (value.type === Type.DIRECTORY) rootDir.dirs.push(value as Directory);
      else rootDir.files.push(value as File);
    } else {
      const parentDir = cache.get(value.parentId as string) as Directory;
      if (value.type === Type.DIRECTORY)
        parentDir.dirs.push(value as Directory);
      else parentDir.files.push(value as File);
    }
  });

  // 获取文件深度
  getDepth(rootDir, 0);

  return rootDir;
}

/**
 * 获取文件深度
 * @param rootDir 根目录
 * @param curDepth 当前深度
 */
function getDepth(rootDir: Directory, curDepth: number) {
  rootDir.files.forEach((file) => {
    file.depth = curDepth + 1;
  });
  rootDir.dirs.forEach((dir) => {
    dir.depth = curDepth + 1;
    getDepth(dir, curDepth + 1);
  });
}

export function findFileByName(
  rootDir: Directory,
  filename: string
): File | undefined {
  let targetFile: File | undefined = undefined;

  function findFile(rootDir: Directory, filename: string) {
    rootDir.files.forEach((file) => {
      if (file.name === filename) {
        targetFile = file;
        return;
      }
    });
    rootDir.dirs.forEach((dir) => {
      findFile(dir, filename);
    });
  }

  findFile(rootDir, filename);
  return targetFile;
}

export function sortDir(l: Directory, r: Directory) {
  return l.name.localeCompare(r.name);
}

export function sortFile(l: File, r: File) {
  return l.name.localeCompare(r.name);
}
