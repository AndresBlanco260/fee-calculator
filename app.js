const fs = require("fs");
let fees = require("./fees.json");
let orders = require("./orders.json");

const calculateOrder = () => {
  let orderArray = [];
  orders.forEach((order) => {
    //   console.log(order);
    orderArray.push(order);
  });

  //for each element of the order array
  orderArray.forEach((order, index) => {
    order.total = 0;

    //printing the order ID
    console.log(`Order ID: ${order.order_number}`);

    order.order_items.forEach((item) => {
      //we are going to use this to add the fee for each type
      //in order to avoid doing a find each time we need to look for a fee type
      const feeTypePrices = {};

      //Getting the information of the fee used on that item
      const feeInfo = fees.find((fee) => {
        return fee.order_item_type === item.type;
      });

      item.total = 0;
      // console.log(feeInfo.fees);

      //getting the fee for each type
      feeInfo.fees.forEach((price) => {
        //   console.log(price);
        feeTypePrices[price.type] = parseInt(price.amount);
      });

      //   console.log(feeTypePrices);
      //adding the flat price for each item
      item.total += feeTypePrices["flat"];
      //adding the flat price for the order total
      order.total += feeTypePrices["flat"];

      //Calculating if theres more than one page how much with need to add.
      //if the item have more than one page and also "per-page" exist in the item then
      if (item.pages > 1 && feeTypePrices["per-page"]) {
        // adding to the totals  the fee per extra page multiplied by the number of pages that the items has
        //without counting the first page (which comes by default)
        item.total += feeTypePrices["per-page"] * (item.pages - 1);
        order.total += feeTypePrices["per-page"] * (item.pages - 1);
      }
      console.log(`Order item ${item.type} ${item.total}`);
    });
    console.log(`Order Total: ${order.total}`);
  });
};

const calculateFunds = () => {
  // Object that will contain every single fund that was added from every order
  let orderDistFeesTotal = {};

  orders.forEach((order) => {
    console.log(`Order ID: ${order.order_number}`);
    // Object that will contain every single fund that was added only from the current order
    let orderDistFees = {};

    order.order_items.forEach((item) => {
      //we are going to use this to add the fee for each type of fund
      //in order to avoid doing a find each time we need to look for a fee type
      const feeTypePrices = {};
      //Getting the information of the fee used on that item
      const feeInfo = fees.find((fee) => {
        return fee.order_item_type === item.type;
      });

      //   console.log(feeInfo);
      //getting the fee for each type
      feeInfo.fees.forEach(
        (prices) => (feeTypePrices[prices.type] = parseFloat(prices.amount))
      );

      feeInfo.distributions.forEach((dist) => {
        //if the current distribution doesnt exist in the current orderDist object , then we will add it
        if (!orderDistFees[dist.name]) {
          orderDistFees[dist.name] = {
            name: dist.name,
            amount: parseFloat(dist.amount),
          };
          //if the current distribution already exist in the current orderDist object , then we are only going to
          //increase the price amount
        } else {
          orderDistFees[dist.name].amount += parseFloat(dist.amount);
        }

        //if the current distribution doesnt exist in the global orderDist object , then we will add it
        if (!orderDistFeesTotal[dist.name]) {
          orderDistFeesTotal[dist.name] = {
            name: dist.name,
            amount: parseFloat(dist.amount),
          };
          //if the current distribution already exist in the global orderDist object , then we are only going to
          //increase the price amount
        } else {
          orderDistFeesTotal[dist.name].amount += parseFloat(dist.amount);
        }
      });
      //if item contains more than one page, and the item have the "per-page" prop , and also the "other" prop
      //doesnt exist in the current order orderDist object , then we will add the prop "other"
      if (item.pages > 1 && feeTypePrices["per-page"] && !orderDistFees.other) {
        orderDistFees.other = {
          name: "Other",
          amount: feeTypePrices["per-page"] * (item.pages - 1),
        };
        //if item contains more than one page, and the item have the "per-page" prop , but the "other" prop already exist
        //then we will only increase the value of other om the current orderDist object.
      } else if (
        item.pages > 1 &&
        feeTypePrices["per-page"] &&
        orderDistFees.other
      ) {
        orderDistFees.other.amount +=
          feeTypePrices["per-page"] * (item.pages - 1);
      }
      //if item contains more than one page, and the item have the "per-page" prop , and also the "other" prop
      //doesnt exist in the global order orderDist object , then we will add the prop "other"
      if (
        item.pages > 1 &&
        feeTypePrices["per-page"] &&
        !orderDistFeesTotal.other
      ) {
        orderDistFeesTotal.other = {
          name: "Other",
          amount: feeTypePrices["per-page"] * (item.pages - 1),
        };
        //if item contains more than one page, and the item have the "per-page" prop , but the "other" prop already exist
        //then we will only increase the value of other om the global orderDist object.
      } else if (
        item.pages > 1 &&
        feeTypePrices["per-page"] &&
        orderDistFeesTotal.other
      ) {
        orderDistFeesTotal.other.amount +=
          feeTypePrices["per-page"] * (item.pages - 1);
      }
    });

    //for each value that is inside the object orderDistFees , we are going to print a new line with all the information
    //of the fund , including the total amount
    Object.values(orderDistFees).forEach((dist) => {
      console.log(` Fund - ${dist.name}: ${dist.amount}`);
    });
  });
  //   console.log(orderDistFeesTotal);
  console.log("Total distributions");

  //for each value that is inside the object orderDistFeesTotal , we are going to print a new line with all the information
  //of the fund , including the total amount
  Object.values(orderDistFeesTotal).forEach((dist) => {
    console.log(` Fund - ${dist.name}: ${dist.amount}`);
  });
};
calculateOrder();
calculateFunds();
