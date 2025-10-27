import FormSearch from "./form-search";
import { ListImageContainer } from "./list-image";

const HomePage = () => {
	return (
		<section className="pt-4 pb-8 md:py-12 h-full w-full">
			<div className="container w-full h-full mx-auto">
				<FormSearch />
				<ListImageContainer />
			</div>
		</section>
	);
};

export default HomePage;
