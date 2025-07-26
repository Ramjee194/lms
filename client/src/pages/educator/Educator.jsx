import Navbar from "../../components/educator/Navbar";
import Sidebar from '../../components/educator/Sidebar';
import EducatorFooter from "../../components/educator/EducatorFooter";
import { Outlet } from 'react-router-dom';

export const Educator = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar/>
      <div className="flex flex-1">
        <Sidebar/>
        <main className="flex-1 p-4">
          <Outlet /> {/* This will render the nested routes */}
        </main>
      </div>
      <EducatorFooter/>
    </div>
  );
}

export default Educator;