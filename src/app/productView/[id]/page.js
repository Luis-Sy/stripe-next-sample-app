

export const dynamic = "force-dynamic";

import AddToCartButton from "../../components/addToCartButton";
import Image from 'next/image'

export default async function Page({ params }) {
  const { id } = await params;
  // fetch specified product and display on page
  const res = await fetch(`${process.env.SITE_URL}/api/getStripeProducts/${id}`);
  const product = await res.json();

  //console.log(product);

  if (!product) {
    return (
		<>
			<h1>404: Product not found</h1>
		</>
	)
  }
	
  return (
    <>
    <div id="productView">
      <div>
        <Image src={product.images[0] } alt={product?.name} width={500} height={500} style={{objectFit: "cover", fill: true}}/>
      </div>
      <div>
        <h1>{product?.name ?? "Unknown Product"}</h1>
        <p>{product?.description ?? "No description available."}</p>
        <h1>${product.prices[0].unit_amount / 100}</h1>
        <AddToCartButton price={product.default_price} />
      </div>
      
    </div>
  </>
);
}
