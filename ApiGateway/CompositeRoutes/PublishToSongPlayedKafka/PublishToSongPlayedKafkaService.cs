using Confluent.Kafka;
using System.Text.Json;

public class PublishToSongPlayedKafkaService
{
    private readonly IProducer<string, string> _producer;

    public PublishToSongPlayedKafkaService(IProducer<string, string> producer)
    {
        _producer = producer;
    }

    public async Task PublishToSongPlayedKafka(SongPlayedEventDto payload)
    {
        var message = new Message<string, string>
        {
            Key = payload.User_Id,
            Value = JsonSerializer.Serialize(payload)
        };

        try
        {
            await _producer.ProduceAsync("song-played-topic", message);
        }
        catch (ProduceException<string, string> ex)
        {
            // Handle the exception (e.g., log it)
            throw new Exception("Error publishing message to Kafka", ex);
        }
    }
}