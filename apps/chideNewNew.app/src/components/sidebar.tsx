import React, {ReactNode} from 'react';
import styled from "@emotion/styled";

export const Sidebar = ({children}: { children: ReactNode }) => {
  return (
    <Aside>
      {children}
    </Aside>
  )
}

const Aside = styled.aside`
  display: block;
  width: 250px;
  height: 100vh;
  border-right: 2px solid;
  border-color: #242424;
  padding-top: 3px;
`

export default Sidebar
