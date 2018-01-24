import Product from "../Product";
import Order from "./Order";

class StopOrder extends Order{
    public stopProduct: Product;
    public stopPrice: number;
}

export default StopOrder;