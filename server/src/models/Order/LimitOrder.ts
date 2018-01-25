import Product from "../Product/CryptoProduct";
import Order from "./Order";

class LimitOrder extends Order{
    public limitProduct: Product;
    public limitPrice: number;
}

export default LimitOrder;