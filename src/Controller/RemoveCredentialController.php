<?php

namespace App\Controller;

use App\Repository\WebauthnCredentialRepository;
use App\Repository\WebauthnUserEntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class RemoveCredentialController extends AbstractController
{
    #[Route('/remove-credential/{id}', name: 'app_remove_credential')]
    public function index(WebauthnCredentialRepository $webauthnCredentialRepository, string $id, EntityManagerInterface $entityManager): Response
    {
        $webauthnCredential = $webauthnCredentialRepository->find($id);
        $entityManager->remove($webauthnCredential);
        $entityManager->flush();

        return $this->redirectToRoute('app_profile');
    }
}
