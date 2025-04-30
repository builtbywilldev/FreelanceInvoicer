import { Input } from "@/components/ui/input";
import { LineItem } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { XCircle } from "lucide-react";

interface LineItemProps {
  item: LineItem;
  onUpdate: (id: string, field: keyof LineItem, value: string | number) => void;
  onRemove: (id: string) => void;
}

export default function LineItemComponent({ item, onUpdate, onRemove }: LineItemProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onUpdate(item.id, name as keyof LineItem, value);
  };

  const amount = item.quantity * item.price;

  return (
    <tr className="border-b border-slate-100">
      <td className="py-2">
        <Input
          type="text"
          name="description"
          value={item.description}
          onChange={handleChange}
          className="w-full px-2 py-1"
          placeholder="Description"
        />
      </td>
      <td className="py-2">
        <Input
          type="number"
          name="quantity"
          min="1"
          value={item.quantity}
          onChange={handleChange}
          className="w-full px-2 py-1"
          placeholder="Qty"
        />
      </td>
      <td className="py-2">
        <Input
          type="number"
          name="price"
          min="0"
          step="0.01"
          value={item.price}
          onChange={handleChange}
          className="w-full px-2 py-1"
          placeholder="Price"
        />
      </td>
      <td className="py-2">
        <div className="w-full px-2 py-1 line-item-amount">
          {formatCurrency(amount)}
        </div>
      </td>
      <td className="py-2">
        <button 
          onClick={() => onRemove(item.id)}
          className="text-red-500 hover:text-red-700"
          type="button"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
