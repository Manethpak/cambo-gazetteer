import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { SearchPage } from "./pages/Search";
import { ProvinceList } from "./pages/ProvinceList";
import { Detail } from "./pages/Detail";
import { DataSource } from "./pages/DataSource";

import { NotFound } from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="explore" element={<ProvinceList />} />
          <Route path="datasource" element={<DataSource />} />
          <Route path="code/:code" element={<Detail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
