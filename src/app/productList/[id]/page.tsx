import AddToCartButton from "../../../components/addToCartButton";

async function getProduct(productId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/getStripeProducts`);
  const products = await res.json();

  return products.find((product: { id: string; }) => product.id === productId) || null;
}

export default async function Page({ params }: { params: { productId: string } }) {
  const { productId } = params;
  const product = await getProduct(productId);

  console.log(product);

  if (!product) {
    return (
		<>
			<h1>404: Product not found</h1>
		</>
	)
  }
	
  return (
  <div>
    <h1>{product?.name ?? "Unknown Product"}</h1>
    <p>{product?.description ?? "No description available."}</p>
    <img src={product.images[0] } alt={product?.name} width="200" />
    <p>Price: ${product.prices[0].unit_amount / 100}</p>
    <p>Price ID: {product?.prices?.[0]?.id ?? "N/A"}</p>
    <AddToCartButton product={product} />
  </div>
);
}
