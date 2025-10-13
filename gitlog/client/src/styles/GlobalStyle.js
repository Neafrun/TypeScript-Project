import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'NanumGothic', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f6f8fa;
    color: #24292e;
    line-height: 1.5;
  }

  /* 한국어 폰트 로딩 */
  @font-face {
    font-family: 'NanumGothic';
    src: url('/NanumGothic.otf') format('opentype');
    font-weight: normal;
    font-style: normal;
  }

  @font-face {
    font-family: 'NanumGothic';
    src: url('/NanumGothicBold.otf') format('opentype');
    font-weight: bold;
    font-style: normal;
  }

  @font-face {
    font-family: 'NanumGothic';
    src: url('/NanumGothicExtraBold.otf') format('opentype');
    font-weight: 800;
    font-style: normal;
  }

  @font-face {
    font-family: 'NanumGothic';
    src: url('/NanumGothicLight.otf') format('opentype');
    font-weight: 300;
    font-style: normal;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }

  a {
    color: #0366d6;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  button {
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
  }
`;

export default GlobalStyle;