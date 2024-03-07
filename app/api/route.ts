export async function GET(request: Request) {
    // eslint-disable-next-line no-console
    console.log(request.headers);
    return new Response(JSON.stringify({ message: "Olá mundo!" }), {
      status: 200,
    });
  }
  
  /*
  import { NextApiRequest, NextApiResponse } from "next";
  export default async function handler(
  @@ -8,3 +17,4 @@ export default async function handler(
    console.log(request.headers);
    response.status(200).json({ message: "Olá mundo!" });
  }
  */
