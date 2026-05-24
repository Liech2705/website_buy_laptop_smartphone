using Npgsql;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        string[] hosts = {
            "aws-0-ap-southeast-1.pooler.supabase.com",
            "aws-1-ap-southeast-1.pooler.supabase.com",
            "aws-2-ap-southeast-1.pooler.supabase.com",
            "pooler.supabase.com"
        };
        
        foreach (var host in hosts)
        {
            Console.WriteLine($"Testing {host}...");
            string connString = $"Host={host};Port=5432;Database=postgres;Username=postgres.mttsjwjeoatvjizbyfaf;Password=0386922767_L;SSL Mode=Require;Trust Server Certificate=true;Multiplexing=true;";
            
            try
            {
                using var conn = new NpgsqlConnection(connString);
                await conn.OpenAsync();
                Console.WriteLine($"[SUCCESS] {host} works perfectly!");
                return;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[FAILED] {host}: {ex.Message}");
            }
        }
    }
}
