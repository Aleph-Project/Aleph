using Confluent.Kafka;
using System.Text.Json;

public class PublishToSongPlayedKafkaService
{
    private readonly IProducer<string, string> _producer;

    public PublishToSongPlayedKafkaService(IProducer<string, string> producer)
    {
        _producer = producer;
    }

    public async Task<KafkaPublishResult> PublishToSongPlayedKafka(SongPlayedEventDto payload)
    {
        var message = new Message<string, string>
        {
            Key = payload.User_Id,
            Value = JsonSerializer.Serialize(payload)
        };

        try
        {
            await _producer.ProduceAsync("song-played-topic", message);

            return new KafkaPublishResult
            {
                Success = true,
                Message = "Message published successfully"
            };
        }
        catch (ProduceException<string, string> ex)
        {
            return new KafkaPublishResult
            {
                Success = false,
                Message = "Failed to publish message to Kafka.",
                Error = ex.Message
            };
        }
    }
}