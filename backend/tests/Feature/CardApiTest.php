<?php

namespace Tests\Feature;

use App\Models\Board;
use App\Models\BoardList;
use App\Models\Card;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CardApiTest extends TestCase
{
    use RefreshDatabase;

    private $board;
    private $listTodo;
    private $listDoing;

    protected function setUp(): void
    {
        parent::setUp();
        $this->board = Board::create(['name' => 'Test Board']);
        $this->listTodo = BoardList::create(['board_id' => $this->board->id, 'name' => 'To Do', 'position' => 0]);
        $this->listDoing = BoardList::create(['board_id' => $this->board->id, 'name' => 'Doing', 'position' => 1]);
    }

    public function test_get_cards_returns_200()
    {
        $response = $this->get('/api/cards');
        $response->assertStatus(200);
    }

    public function test_post_cards_creates_card()
    {
        $response = $this->postJson('/api/cards', [
            'board_id' => $this->board->id,
            'list_id' => $this->listTodo->id,
            'title' => 'Test Card'
        ]);

        $response->assertSuccessful();
        $this->assertDatabaseHas('cards', ['title' => 'Test Card']);
    }

    public function test_put_cards_updates_card()
    {
        $card = Card::create([
            'board_id' => $this->board->id,
            'list_id' => $this->listTodo->id,
            'title' => 'Old Title'
        ]);

        $response = $this->putJson("/api/cards/{$card->id}", [
            'title' => 'New Title',
            'list_id' => $this->listTodo->id
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('cards', ['title' => 'New Title']);
    }

    public function test_delete_cards_deletes_card()
    {
        $card = Card::create([
            'board_id' => $this->board->id,
            'list_id' => $this->listTodo->id,
            'title' => 'Delete Me'
        ]);

        $response = $this->delete("/api/cards/{$card->id}");
        $response->assertStatus(200);
        $this->assertDatabaseMissing('cards', ['id' => $card->id]);
    }

    public function test_patch_cards_move_updates_list_id()
    {
        $card = Card::create([
            'board_id' => $this->board->id,
            'list_id' => $this->listTodo->id,
            'title' => 'Move Me'
        ]);

        $response = $this->patchJson("/api/cards/{$card->id}/move", [
            'list_id' => $this->listDoing->id
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('cards', ['id' => $card->id, 'list_id' => $this->listDoing->id]);
        $this->assertDatabaseHas('card_activities', ['card_id' => $card->id, 'action' => 'Moved']);
    }

    public function test_get_cards_activity_returns_activity_log()
    {
        $card = Card::create([
            'board_id' => $this->board->id,
            'list_id' => $this->listTodo->id,
            'title' => 'Activity Test'
        ]);

        \App\Models\CardActivity::create([
            'card_id' => $card->id,
            'action' => 'Test Action'
        ]);

        $response = $this->get("/api/cards/{$card->id}/activity");
        $response->assertStatus(200);
        $response->assertJsonFragment(['action' => 'Test Action']);
    }
}
