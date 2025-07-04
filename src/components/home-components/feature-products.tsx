"use client";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { useEffect, useState } from "react";
import Loader from "./loader";
import ProductCard, { Product } from "./product-card";
import { motion } from "framer-motion";

const FeatureProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const query = `*[_type == "productList"] | order(_createdAt desc) [0...8] {
          _id,
          name,
          description,
          price,
          image,
          discountPrice,
          slug,
          colors,
          department,
          rating,
          stock,
          inStock
        }`;
        const data: Product[] = await client.fetch(query);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-lg text-[#252B42]">
        <Loader />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center text-lg text-[#252B42] py-20">
        <p>No products available at the moment.</p>
      </div>
    );
  }

  // Animation variants for product cards
  const productCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  // Animation variants for text sections
  const textVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  // Animation variants for images
  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <div className="flex flex-col items-center justify-center text-center mt-28 mb-7 overflow-x-hidden wrapper">
      {/* Heading Section */}
      <motion.div
        variants={textVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <h3 className="text-[#737373] text-[20px]">Featured Products</h3>
        <h2 className="text-[#252B42] text-[24px] font-bold mt-2">
          BESTSELLER PRODUCTS
        </h2>
        <p className="text-[#737373] text-[14px] mt-2">
          Problems trying to resolve the conflict between
        </p>
      </motion.div>

      {/* Product Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-1 mt-6 w-full">
        {products.map((product, index) => (
          <motion.div
            key={product._id}
            variants={productCardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 }} // Staggered delay
          >
            <Link href={`/productList/${product.slug?.current}`} passHref>
              <div>
                <ProductCard product={product} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Green Background Section */}
      <motion.div
        className="bg-[#23856D] sm:h-[990px] md:h-[713px] w-full mt-16 pt-7 flex items-center justify-between flex-col md:flex-row"
        variants={textVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* Text Section */}
        <div className="text-white space-y-4 ml-4 sm:ml-12 md:ml-36 text-center sm:text-left">
          <h3 className="text-[20px]">SUMMER 2020</h3>
          <h2 className="text-[40px] sm:text-[50px] md:text-[58px] font-bold">
            Vita Classic <br /> <span>Product</span>
          </h2>
          <p className="text-[14px] sm:text-[16px]">
            We know how large objects will act, <br />
            <span>how objects will act, We know</span>
          </p>

          {/* Price and Button Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 sm:mt-8 pb-7">
            <h3 className="text-[24px] font-bold">{`$16.48`}</h3>
            <motion.button
              className="text-[14px] font-bold bg-[#2DC071] py-4 px-10 rounded-md hover:bg-green-600 mt-4 sm:mt-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ADD TO CART
            </motion.button>
          </div>
        </div>

        {/* Image Section */}
        <motion.div
          className="w-full sm:w-[400px] md:w-[510px] flex-shrink-0"
          variants={imageVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Image
            src={"/classic.png"}
            alt="classic"
            width={510}
            height={685}
            className="w-full object-cover"
          />
        </motion.div>
      </motion.div>

      {/* Universe Section */}
      <motion.div
        className="flex items-center justify-between mt-16 flex-col md:flex-row"
        variants={textVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* Image Section */}
        <motion.div
          className="w-full md:w-auto"
          variants={imageVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Image
            src={"/universe.png"}
            alt="universe"
            height={704}
            width={682}
            className="w-full"
          />
        </motion.div>

        {/* Text Section */}
        <div className="text-center md:text-left w-full md:w-auto mt-6 md:mt-0">
          <h3 className="text-[#BDBDBD] font-bold text-[16px]">SUMMER 2020</h3>
          <h2 className="text-[#252B42] font-bold text-[30px] sm:text-[40px] mt-8">
            Part of the Neural <br /> Universe
          </h2>
          <p className="text-[#737373] text-[14px] sm:text-[20px] mt-7">
            We know how large objects will act, <br />
            but things on a small scale.
          </p>
          <div className="flex gap-5 mt-5 justify-center md:justify-start">
            <motion.button
              className="text-white text-[14px] font-bold py-3 px-8 rounded-md bg-[#23A6F0] hover:bg-transparent hover:text-blue-500 md:bg-[#2DC071] md:hover:bg-transparent md:hover:text-[#2DC071]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Buy Now
            </motion.button>
            <motion.button
              className="text-[#23A6F0] text-[14px] font-bold py-3 px-8 rounded-md border-2 border-[#23A6F0] hover:bg-[#23A6F0] hover:text-white md:border-[#2DC071] md:text-[#2DC071] md:hover:bg-transparent md:hover:bg-green-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Read More
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FeatureProducts;