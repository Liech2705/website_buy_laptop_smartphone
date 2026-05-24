namespace Liechtop.Application.Utils
{
    public static class OrderStateMachine
    {
        public static bool IsValidTransition(string oldStatus, string newStatus, string paymentMethod)
        {
            // If already at terminal states, prevent any updates
            if (oldStatus == "Completed" || oldStatus == "Cancelled" || oldStatus == "Restocked")
                return false;

            // Common transition for Cancel (Can cancel if user proposes it or Admin wants it)
            // But usually only if not yet shipped
            if (newStatus == "Cancelled")
            {
                if (oldStatus == "Pending" || oldStatus == "Paid" || oldStatus == "Processing" || oldStatus == "CancelRequested")
                {
                    return true;
                }
                return false; // Cannot cancel if Shipped or Delivered
            }

            if (newStatus == "CancelRequested")
            {
                return oldStatus == "Pending" || oldStatus == "Paid" || oldStatus == "Processing";
            }

            if (oldStatus == "CancelRequested")
            {
                // Can approve (Cancelled or Restocked) or reject (Processing)
                return newStatus == "Cancelled" || newStatus == "Restocked" || newStatus == "Processing";
            }

            // Normal progression
            switch (oldStatus)
            {
                case "Pending":
                    if (paymentMethod == "COD")
                    {
                        // COD goes directly to Processing
                        return newStatus == "Processing"; 
                    }
                    else
                    {
                        // Online payment goes to Paid when webhook hits
                        return newStatus == "Paid";
                    }

                case "Paid":
                    return newStatus == "Processing";

                case "Processing":
                    return newStatus == "Shipped";

                case "Shipped":
                    return newStatus == "Delivered";

                case "Delivered":
                    return newStatus == "Completed"; 
                    // Technically "Delivered" could transition to "Paid" if it was COD, 
                    // but usually COD order gets paid at Delivery point, 
                    // and we just mark it as Completed or track payment log. 
                    // Let's keep the user's linear flow (Shipped -> Delivered -> Completed)

                default:
                    return false;
            }
        }
    }
}
