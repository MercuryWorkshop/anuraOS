import React, {ReactNode} from 'react'
import {SiHtml5, SiCss3, SiJavascript, SiTypescript, SiJson} from "react-icons/si";
import {FcFolder, FcOpenedFolder, FcPicture, FcFile} from "react-icons/fc";
import {AiFillFileText} from "react-icons/ai";

function getIconHelper() {
  const cache = new Map<string, ReactNode>();
  cache.set("js", <SiJavascript color="#fbcb38"/>);
  cache.set("jsx", <SiJavascript color="#fbcb38"/>);
  cache.set("ts", <SiTypescript color="#378baa"/>);
  cache.set("tsx", <SiTypescript color="#378baa"/>);
  cache.set("css", <SiCss3 color="purple"/>);
  cache.set("json", <SiJson color="#5656e6"/>);
  cache.set("html", <SiHtml5 color="#e04e2c"/>);
  cache.set("png", <FcPicture/>);
  cache.set("jpg", <FcPicture/>);
  cache.set("ico", <FcPicture/>);
  cache.set("txt", <AiFillFileText color="white"/>);
  cache.set("closedDirectory", <FcFolder/>);
  cache.set("openDirectory", <FcOpenedFolder/>);
  return function (extension: string, name: string): ReactNode {
    if (cache.has(extension))
      return cache.get(extension);
    else if (cache.has(name))
      return cache.get(name);
    else
      return <FcFile/>;
  }
}

export const getIcon = getIconHelper();
