import Hero from "@/components/Hero";
import About from "@/components/About";
import Events from "@/components/Events";



function Home(){
  return(
    <div className="space-y-12 p-6 md:p-8 lg:p-12">
      <Hero />
      <About />
      <Events />
    </div>
  );
}

export default Home;