declare module "midtrans-client" {
  const midtransClient: {
    Snap: new (config: { isProduction: boolean; serverKey: string }) => {
      createTransaction(params: Record<string, unknown>): Promise<{
        token: string;
        redirect_url: string;
      }>;
    };
  };
  export default midtransClient;
}
