import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { SearchPage } from "./pages/Search";
import { ProvinceList } from "./pages/ProvinceList";
import { Detail } from "./pages/Detail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="provinces" element={<ProvinceList />} />
          <Route path="code/:code" element={<Detail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
